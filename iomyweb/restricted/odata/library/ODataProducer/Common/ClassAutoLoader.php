<?php
/** 
 * Auto loader class for loading classes during compile time.
 * 
 * PHP version 5.3
 * 
 * @category  ODataPHPProd
 * @package   ODataProducer_Common
 * @author    Microsoft Open Technologies, Inc. <msopentech@microsoft.com>
 * @copyright Microsoft Open Technologies, Inc.
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   GIT: 1.2
 * @link      https://github.com/MSOpenTech/odataphpprod
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  Redistributions of source code must retain the above copyright notice, this list
 *  of conditions and the following disclaimer.
 *  Redistributions in binary form must reproduce the above copyright notice, this
 *  list of conditions  and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A  PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS
 * OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)  HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
 * IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 */
namespace ODataProducer\Common;
/** 
 * Auto loader class
 * 
 * @category  ODataPHPProd
 * @package   ODataProducer_Common
 * @author    Microsoft Open Technologies, Inc. <msopentech@microsoft.com>
 * @copyright Microsoft Open Technologies, Inc.
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   GIT: 1.2
 * @link      https://github.com/MSOpenTech/odataphpprod
 */
class ClassAutoLoader
{
    const FILEEXTENSION = '.php';

    /**
     * @var ODataProducer\Common\ClassAutoLoader
     */
    protected static $classAutoLoader;

    /**
     * Register class loader call back
     * 
     * @return void
     */
    public static function register()
    {
        if (self::$classAutoLoader == null) {
            self::$classAutoLoader = new ClassAutoLoader();
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                spl_autoload_register(
                    array(self::$classAutoLoader, 'autoLoadWindows')
                );
            } else {
                spl_autoload_register(
                    array(self::$classAutoLoader, 'autoLoadNonWindows')
                );
            }
        }
    }

    /**
     * Un-Register class loader call back
     * 
     * @return void
     */
    public static function unRegister()
    {
        if (self::$classAutoLoader != null) {
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                spl_autoload_unregister(
                    array(self::$classAutoLoader, 'autoLoadWindows')
                );
            } else {
                spl_autoload_unregister(
                    array(self::$classAutoLoader, 'autoLoadNonWindows')
                );
            }
            
        }
    }

    /**
     * Callback for class autoloading in Windows environment.
     * 
     * @param string $classPath Path of the class to load
     * 
     * @return void
     */
    public function autoLoadWindows($classPath)
    {
        //include_once $classPath . self::FILEEXTENSION;
		$classPath = str_replace("\\", "/", $classPath);
        include_once $classPath . self::FILEEXTENSION;
    }

    /**
     * Callback for class autoloading in linux flavours.
     * 
     * @param string $classPath Path of the class to load
     * 
     * @return void
     */
    public function autoLoadNonWindows($classPath)
    {
        $classPath = str_replace("\\", "/", $classPath);
        include_once $classPath . self::FILEEXTENSION;
    }
}
?>