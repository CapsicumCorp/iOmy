<?php

//========================================================================================================//
//== @url:          http://stackoverflow.com/questions/5089841/two-way-encryption-i-need-to-store-passwords-that-can-be-retrieved/5093422#5093422
//== @description:  
//== @Copyright: Capsicum Corporation 2015-2016
//==
//== 
//== This file is part of Backend of the iOmy project.
//========================================================================================================//
//== iOmy is free software: you can redistribute it and/or modify it under the terms of the
//== GNU General Public License as published by the Free Software Foundation, either version 3 of the
//== License, or (at your option) any later version.
//== 
//== iOmy is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//== without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//== See the GNU General Public License for more details.
//== 
//== You should have received a copy of the GNU General Public License along with iOmy.
//== If not, see <http://www.gnu.org/licenses/>.
//========================================================================================================//




/**
 **********************************************************************************************************
 * 
 **********************************************************************************************************
 * @Description class to handle secure encryption and decryption of arbitrary data
 * 
 * @Note This is not just straight encryption.  It also has a few other features in it to make the 
 * encrypted data far more secure.  Note that any other implementations used to decrypt data will have to 
 * do the same exact operations.
 *
 * Security Benefits:
 *
 * - Uses Key stretching
 * - Hides the Initialization Vector
 * - Does HMAC verification of source data
 *
 **********************************************************************************************************/
class TestEncryption {

	/**
	 * @var string $cipher The mcrypt cipher to use for this instance
	 */
	protected $cipher = '';

	/**
	 * @var int $mode The mcrypt cipher mode to use
	 */
	protected $mode = '';

	/**
	 * @var int $iRounds The number of rounds to feed into PBKDF2 for key generation
	 */
	protected $iRounds = 0;		//-- NOTE: This is just a dummy value as the real value overwrites this a couple of lines down --//

	/**
	 * @var string $sCryptKey 
	 */
	protected $sCryptKey = "";	



	/**
	 **********************************************************************************************************
	 * Constructor!
	 **********************************************************************************************************
	 * @param string    $cipher         The MCRYPT_* cypher to use for this instance
	 * @param int       $mode           The MCRYPT_MODE_* mode to use for this instance
	 * @param int       $iRounds        The number of PBKDF2 rounds to do on the key
	 * @param string    $sCryptKey      The default cryptkey if no other is provided when encrypting or decrypting
	 **********************************************************************************************************/
	public function __construct( $cipher, $mode, $iRounds = 10000, $sCryptKey ) {
		$this->cipher   = $cipher;
		$this->mode     = $mode;
		$this->iRounds  = (int) $iRounds;
		$this->sCryptKey = $sCryptKey;
	}
	
	
	/**
	 **********************************************************************************************************
	 * Decrypt the data with the provided key
	 **********************************************************************************************************
	 * @param string    $sData          The encrypted data to decrypt
	 * @param string    $sCryptKey      The key to use for decryption. If null then use the default key
	 * 
	 * @returns string|false The returned string if decryption is successful false if it is not
	 **********************************************************************************************************/
	public function decrypt($sData, $sCryptKey=null) {
		
		//-- STEP 1 - Use Default Key if none has been provided --//
		if($sCryptKey===null) {
			$sCryptKey = $this->sCryptKey;
		}
		
		//-- STEP 2 - Setup the other variables --//
		$salt   = substr($sData, 0, 128);
		$enc    = substr($sData, 128, -64);
		$mac    = substr($sData, -64);

		//-- STEP 3 --//
		list ($cipherKey, $macKey, $iv) = $this->getKeys($salt, $sCryptKey);

		if ( !hash_equals(hash_hmac('sha512', $enc, $macKey, true), $mac) ) {
			 return false;
		}

		$dec = mcrypt_decrypt($this->cipher, $cipherKey, $enc, $this->mode, $iv);

		$sData = $this->unpad($dec);

		return $sData;
	}

	/**
	 **********************************************************************************************************
	 * Encrypt the supplied data using the supplied key
	 **********************************************************************************************************
	 * @param string $sData The data to encrypt
	 * @param string $sCryptKey The key to encrypt with. If null then use the default key
	 *
	 * @returns string The encrypted data
	 **********************************************************************************************************/
	public function encrypt($sData, $sCryptKey=null) {
		//-- STEP 1 - Use Default Key if none has been provided --//
		if($sCryptKey===null) {
			$sCryptKey = $this->sCryptKey;
		}
		
		//-- STEP 2 - Setup the other variables --//
		$salt = mcrypt_create_iv(128, MCRYPT_DEV_URANDOM);
		list ($cipherKey, $macKey, $iv) = $this->getKeys($salt, $sCryptKey);

		$sData = $this->pad($sData);

		$enc = mcrypt_encrypt($this->cipher, $cipherKey, $sData, $this->mode, $iv);

		$mac = hash_hmac('sha512', $enc, $macKey, true);
		return $salt . $enc . $mac;
	}

	/**
	 **********************************************************************************************************
	 * Generates a set of keys given a random salt and a master key
	 **********************************************************************************************************
	 * @param string $salt A random string to change the keys each encryption
	 * @param string $key  The supplied key to encrypt with
	 *
	 * @returns array An array of keys (a cipher key, a mac key, and a IV)
	 **********************************************************************************************************/
	protected function getKeys($salt, $key) {
		$ivSize = mcrypt_get_iv_size( $this->cipher, $this->mode );
		$keySize = mcrypt_get_key_size( $this->cipher, $this->mode );
		$length = 2 * $keySize + $ivSize;

		$key = $this->pbkdf2('sha512', $key, $salt, $this->iRounds, $length);

		$cipherKey = substr($key, 0, $keySize);
		$macKey = substr($key, $keySize, $keySize);
		$iv = substr($key, 2 * $keySize);
		return array($cipherKey, $macKey, $iv);
	}

	/**
	 **********************************************************************************************************
	 * Stretch the key using the PBKDF2 algorithm
	 **********************************************************************************************************
	 * @see http://en.wikipedia.org/wiki/PBKDF2
	 *
	 * @param string    $algo       The algorithm to use
	 * @param string    $key        The key to stretch
	 * @param string    $salt       A random salt
	 * @param int       $iRounds    The number of rounds to derive
	 * @param int       $length     The length of the output key
	 *
	 * @returns string The derived key.
	 **********************************************************************************************************/
	protected function pbkdf2($algo, $key, $salt, $iRounds, $length) {
		$size   = strlen(hash($algo, '', true));
		$len	= ceil($length / $size);
		$result = '';
		for ($i = 1; $i <= $len; $i++) {
			$tmp = hash_hmac($algo, $salt . pack('N', $i), $key, true);
			$res = $tmp;
			for ($j = 1; $j < $iRounds; $j++) {
				$tmp  = hash_hmac($algo, $tmp, $key, true);
				$res ^= $tmp;
			}
			$result .= $res;
		}
		return substr($result, 0, $length);
	}

	/**
	 **********************************************************************************************************
	 * 
	 **********************************************************************************************************
	 * 
	 * 
	 **********************************************************************************************************/
	protected function pad($data) {
		$length = mcrypt_get_block_size($this->cipher, $this->mode);
		$padAmount = $length - strlen($data) % $length;
		if ($padAmount == 0) {
			$padAmount = $length;
		}
		return $data . str_repeat(chr($padAmount), $padAmount);
	}

	/**
	 **********************************************************************************************************
	 * 
	 **********************************************************************************************************
	 * 
	 * 
	 **********************************************************************************************************/
	protected function unpad($data) {
		$length = mcrypt_get_block_size($this->cipher, $this->mode);
		$last = ord($data[strlen($data) - 1]);
		if ($last > $length) return false;
		if (substr($data, -1 * $last) !== str_repeat(chr($last), $last)) {
			return false;
		}
		return substr($data, 0, -1 * $last);
	}
	
	
}		//== END OF ENCRYPTION OBJECT ==//

?>