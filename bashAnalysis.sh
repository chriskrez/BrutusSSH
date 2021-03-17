#!/bin/bash

figlet Brutus SSH
regex=".*Failed password for( invalid user)? (.+) from ([[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+).*"

users=`cat $1 | sed -rn "s/$regex/\2|/p"`
ips=`cat $1 | sed -rn "s/$regex/\3|/p"`

echo "Most used usernames"
echo $users | tr "|" "\n" | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
printf "\n"

echo "Most common ips"
echo $ips | tr "|" "\n" | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
printf "\n"

echo "Most common countries"
echo $ips | tr "|" "\n" | awk '{print $1}' | xargs -n1 geoiplookup | awk '{print $5}' | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
