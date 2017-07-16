

$.sap.declare("IOMy.validation", true);

$.extend(IOMy.validation, {
	
	/**
	 * Checks an IPv4 address to see if it's in a valid format.
	 * 
	 * @param {type} sIPAddress				IP Address to validate.
	 * @returns {map}						The map containing result information including whether it's valid and any error message.
	 * 
	 * @throws MissingArgumentException		if the address is not given, of course.
	 */
	isIPv4AddressValid : function (sIPAddress) {
		//-------------------------------------------------//
		// Variables
		//-------------------------------------------------//
		var bError					= false;
		var aErrorMessages			= [];
		var aThreeDots				= [];
		var aIPAddressParts			= [];
		var bIPAddressFormatError	= false;
		var mResult					= {};
		
		//-------------------------------------------------//
		// Check that the IP address is given.
		//-------------------------------------------------//
		if (sIPAddress === null || sIPAddress === undefined || sIPAddress === false || sIPAddress.length === 0) {
			throw new MissingArgumentException("Where is the IPv4 address?");
		}
		
		//-------------------------------------------------//
		// Are there three dots in the IP Address?         //
		//-------------------------------------------------//
		aThreeDots = sIPAddress.match(/\./g);

		if (aThreeDots === null || aThreeDots.length !== 3) {
			bError = true; // No. FAIL!
			aErrorMessages.push("There must be only 4 parts separated by dots ('.') in an IPv4 address.");
		} else {
			//---------------------------------------------------------//
			// There are three dots. Are the four parts valid numbers? //
			//---------------------------------------------------------//
			aIPAddressParts = sIPAddress.split('.');

			// Check each number
			for (var i = 0; i < aIPAddressParts.length; i++) {
				for (var j = 0; j < aIPAddressParts[i].length; j++) {
					// Spaces and the plus symbol are ignored by isNaN(). isNaN() covers the rest.
					if (aIPAddressParts[i].charAt(j) === ' ' || aIPAddressParts[i].charAt(j) === '+' || isNaN(aIPAddressParts[i].charAt(j))) {
						bIPAddressFormatError = true; // INVALID CHARACTER
						break;
					}
				}
				
				if (aIPAddressParts[i].length > 1 && aIPAddressParts[i].charAt(0) === "0") {
					bError = true;
					aErrorMessages.push("One of the numbers start with '0'.");
				}

				if (bIPAddressFormatError === true) {
					bError = true;
					aErrorMessages.push("One of the numbers contains invalid characters.");
					break;
				} else if (parseInt(aIPAddressParts[i]) < 0 || parseInt(aIPAddressParts[i]) > 255) {
					bError = true;
					aErrorMessages.push("One of the numbers is greater than 255 or a negative number.");
					break;
				}
			}
		}
		
		//-------------------------------------------------//
		// Prepare the result map.
		//-------------------------------------------------//
		mResult.bValid			= !bError;
		mResult.aErrorMessages	= aErrorMessages;
		
		return mResult;
	},
	
	isIPv4PortValid : function (sIPPort) {
		//-------------------------------------------------//
		// Variables
		//-------------------------------------------------//
		var bError					= false;
		var aErrorMessages			= [];
		var aDigits					= [];
		var aInvalidChars			= [];
		var aIPAddressParts			= [];
		var bIPAddressFormatError	= false;
		var mResult					= {};
		
		//-------------------------------------------------//
		// Check that the IP address is given.
		//-------------------------------------------------//
		if (sIPPort === null || sIPPort === undefined || sIPPort === false || sIPPort.length === 0) {
			throw new MissingArgumentException("Where is the IPv4 port?");
		}
		
		//aDigits			= sIPPort.match(/[0-9]/g);
		aInvalidChars	= sIPPort.match(/[^0-9]/g);
		
		if (aInvalidChars !== null) {
			bError = true;
			aErrorMessages.push("The port contains invalid character(s).");
		}
		
		//-------------------------------------------------//
		// Prepare the result map.
		//-------------------------------------------------//
		mResult.bValid			= !bError;
		mResult.aErrorMessages	= aErrorMessages;
		
		return mResult;
	}
});