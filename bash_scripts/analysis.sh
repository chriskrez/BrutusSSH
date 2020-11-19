#!/bin/bash

echo -e "SSH Log Analysis\n" > analysis.txt
cat $1 | grep "Invalid user" > invalidUsers.txt
awk '{print $8}' invalidUsers.txt | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' > usernames.txt

echo "Most used usernames" >> analysis.txt
head -5 usernames.txt >> analysis.txt
printf "\n" >> analysis.txt
rm ./usernames.txt

awk '{print $10}' invalidUsers.txt | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' > ips.txt
rm ./invalidUsers.txt

echo "Most common ips" >> analysis.txt
head -5 ips.txt >> analysis.txt
printf "\n" >> analysis.txt

cat ips.txt | xargs -n 1 geoiplookup { } | awk '{print $5}' | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' > countries.txt
rm ./ips.txt

echo "Most common countries" >> analysis.txt
head -5 countries.txt >> analysis.txt
rm ./countries.txt
