<?php


use ODataProducer\Configuration\EntitySetRights;
require_once 'ODataProducer/IDataService.php';
require_once 'ODataProducer/IRequestHandler.php';
require_once 'ODataProducer/DataService.php';
require_once 'ODataProducer/IServiceProvider.php';
use ODataProducer\Configuration\DataServiceProtocolVersion;
use ODataProducer\Configuration\DataServiceConfiguration;
use ODataProducer\IServiceProvider;
use ODataProducer\DataService;

require_once 'MainMetadata.php';
require_once 'MainQueryProvider.php';
require_once 'MainDSExpressionProvider.php';



class MainDataService extends DataService implements IServiceProvider {
	private $_MainMetadata                       = null;
	private $_MainQueryProvider                  = null;
	private $_MainExpressionProvider             = null;
	
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
			if (is_null($this->_MainExpressionProvider)) {
				$this->_MainExpressionProvider = new MainDSExpressionProvider();
			}
		}
		
		if ($serviceType === 'IDataServiceMetadataProvider') {
			if (is_null($this->_MainMetadata)) {
				$this->_MainMetadata = CreateMainMetadata::create();
			}
			return $this->_MainMetadata;
		} else if ($serviceType === 'IDataServiceQueryProvider2') {
			if (is_null($this->_MainQueryProvider)) {
				$this->_MainQueryProvider = new MainQueryProvider();
			}
			return $this->_MainQueryProvider;
		} else if ($serviceType === 'IDataServiceStreamProvider') {
			return new MainStreamProvider();
		}
		return null;
	}
}

?>
