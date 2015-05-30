#!/bin/bash

FILE_NAME=$1
WORKING_DIRECTORY=${PWD##*/}

echo "-- Converting tabs to space for $FILE_NAME"
echo "-- Creating temporary directory..."
mkdir /home/traveloka/tmp-expand
echo "-- Start expand command... "
expand --tabs=3 $FILE_NAME > /home/traveloka/tmp-expand/$FILE_NAME
echo "-- Moving file $FILE_NAME..."
mv /home/traveloka/tmp-expand/$FILE_NAME $FILE_NAME
echo "-- Removing temporary directory..."
rmdir /home/traveloka/tmp-expand
echo "-- Done. Please check."
