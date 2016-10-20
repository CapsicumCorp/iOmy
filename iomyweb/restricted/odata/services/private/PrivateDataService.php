<?php

 /**
 * Implementation of IServiceProvider.
 *
 * PHP version 5.3
 *
 * @category  Service
 * @package   Service_Private
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   SVN: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 * 
 */
use ODataProducer\Configuration\EntitySetRights;
require_once 'ODataProducer/IDataService.php';
require_once 'ODataProducer/IRequestHandler.php';
require_once 'ODataProducer/DataService.php';
require_once 'ODataProducer/IServiceProvider.php';
use ODataProducer\Configuration\DataServiceProtocolVersion;
use ODataProducer\Configuration\DataServiceConfiguration;
use ODataProducer\IServiceProvider;
use ODataProducer\DataService;

require_once 'PrivateMetadata.php';
require_once 'PrivateQueryProvider.php';
require_once 'PrivateDSExpressionProvider.php';

/**
 * PrivateDataService that implements IServiceProvider.
 * 
 * @category  Service
 * @package   Service_Private
 * @author	Yash K Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class PrivateDataService extends DataService implements IServiceProvider {
	private $_PrivateMetadata						= null;
	private $_PrivateQueryProvider					= null;
	private $_PrivateExpressionProvider				= null;
	
	/**
	 * This method is called only once to initialize service-wide policies
	 * 
	 * @param DataServiceConfiguration &$config Data service configuration object
	 * 
	 * @return void
	 */
	public function initializeService(DataServiceConfiguration &$config) {
		$config->setEntitySetPageSize('*', 1000);
		$config->setEntitySetAccessRule('*', EntitySetRights::ALL);
		$config->setAcceptCountRequests(true);
		$config->setAcceptProjectionRequests(true);
		$config->setMaxDataServiceVersion(DataServiceProtocolVersion::V3);

	}

	/**
	 * Get the service like IDataServiceMetadataProvider, IDataServiceQueryProvider, IDataServiceStreamProvider
	 * 
	 * @param String $serviceType Type of service IDataServiceMetadataProvider, IDataServiceQueryProvider, IDataServiceStreamProvider
	 * @see library/ODataProducer/ODataProducer.IServiceProvider::getService()
	 * @return object
	 */
	public function getService($serviceType) {
		
		if (($serviceType === 'IDataServiceMetadataProvider') 
			|| ($serviceType === 'IDataServiceQueryProvider2') 
			|| ($serviceType === 'IDataServiceStreamProvider')
		) {
			if (is_null($this->_PrivateExpressionProvider)) {
				$this->_PrivateExpressionProvider = new PrivateDSExpressionProvider();
			}
		}
		
		if ($serviceType === 'IDataServiceMetadataProvider') {
			if (is_null($this->_PrivateMetadata)) {
				$this->_PrivateMetadata = CreatePrivateMetadata::create();
			}
			return $this->_PrivateMetadata;
		} else if ($serviceType === 'IDataServiceQueryProvider2') {
			if (is_null($this->_PrivateQueryProvider)) {
				$this->_PrivateQueryProvider = new PrivateQueryProvider();
			}
			return $this->_PrivateQueryProvider;
		} else if ($serviceType === 'IDataServiceStreamProvider') {
			return new PrivateStreamProvider();
		}
		return null;
	}
}

?>
