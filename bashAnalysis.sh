#!/bin/bash

figlet Brutus SSH
lines=`grep "Invalid user" $1`

echo "Most used usernames"
echo "$lines" | awk '{print $8}' | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
printf "\n"

echo "Most common ips"
echo "$lines" | awk '{print $10}' | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
printf "\n"

echo "Most common countries"
echo "$lines" | awk '{print $10}' | xargs -n1 geoiplookup | awk '{print $5}' | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
