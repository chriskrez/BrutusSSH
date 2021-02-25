#!/bin/bash

figlet Brutus SSH
echo "Most used usernames"
cat $1 | grep "Invalid user" | awk '{print $8}' | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
printf "\n"

echo "Most common ips"
cat $1 | grep "Invalid user" | awk '{print $10}' | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
printf "\n"

echo "Most common countries"
cat $1 | grep "Invalid user" | awk '{print $10}' | xargs -n1 geoiplookup | awk '{print $5}' | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
