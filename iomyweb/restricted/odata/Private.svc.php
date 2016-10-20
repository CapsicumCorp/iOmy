<?php
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}
$_SERVER["REQUEST_URI"] = str_replace( "Private.svc.php", "Private.svc", $_SERVER["REQUEST_URI"] );

require SITE_BASE."/restricted/odata/index.php";

?>
