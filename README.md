# iOmy
iOmy  automation and monitoring platform Developed by Capsicum Corporation.

It is designed to run on a Android device ie STB but will run on a tablet or phone parts or all could also be run on a linux server with some modification

There are 3 main components

c program called watchinputs which monitors and controls devices. It currently supports Zigbee devices like smart plugs, light globes, motion and temp sensors.

It also supports Phillips Hue lights via its API

iOmyapp is an Android application which includes a webserver and database watchinputs stores data in the db, the app allows the configuration and management of the iOmy platform.

iOmyweb is a collection of pages that provides a basic user interface that allows the displaying of data from the db and to modify this data to control devices ie turn off a light.
