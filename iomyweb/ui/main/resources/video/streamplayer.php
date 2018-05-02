<?php

	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	$sURL = "";
	
	
	//----------------------------------------------------//
	//-- 2.0 - Check if a StreamId has been specified   --//
	//----------------------------------------------------//
	if( isset( $_GET['StreamId'] ) ) {
		if( $_GET['StreamId']!==null && $_GET['StreamId']!==false && $_GET['StreamId']!=="" ) {
			if( ctype_alnum( $_GET['StreamId'] ) ) {
				$sURL = "/streams/".$_GET['StreamId']."/stream.m3u8";
			}
		}
	}
	
	
	
	
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>videojs-contrib-hls embed</title>
		
<!--
		Uses the latest versions of video.js and videojs-contrib-hls.
		
		To use specific versions, please change the URLs to the form:
		
		<link href="https://unpkg.com/video.js@5.16.0/dist/video-js.css" rel="stylesheet">
		<script src="https://unpkg.com/video.js@5.16.0/dist/video.js"></script>
		<script src="https://unpkg.com/videojs-contrib-hls@4.1.1/dist/videojs-contrib-hls.js"></script>
-->
		
		<link href="resources/css/video-js.css" rel="stylesheet" />
		<script src="resources/js/video.js"></script>
		<script src="resources/js/videojs-contrib-hls.js"></script>
        
        <!--
        I've added this to correct the width of the video stream being displayed.
        -->
        <style>
            .my_video_1-dimensions {
                width: 100%;
                height: 268px;
            }
        </style>
	</head>
	<body>
		<video id="my_video_1" class="video-js vjs-default-skin" controls autoplay preload="auto" width="100%" height="268" data-setup='{}'>
			<source src="<?php echo $sURL; ?>" type="application/x-mpegURL" />
		</video>
	</body>
</html>

