#!/bin/bash
usage="$(basename "$0") [-h] [auth.log] -- limited text version of Brutussh app
 run : Brutussh.sh auth.log"

while getopts ':hs:' option; do
  case "$option" in
    h) echo "$usage"
       exit
       ;;
  esac
done

figlet Brutus SSH
regex=".*Failed password for( invalid user)? (.+) from ([[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+).*"

echo -n -e "[+]\e[32mPeriod : \e[0m" 
A=`awk -F"/" '{ if(NR ==1){print $NF}}' $1 | awk '{print $1,$2}'`
B=`awk -F"/" 'END {print $NF}' $1 | awk '{print $1,$2}'`
echo $A "-" $B

users=`cat $1 | sed -rn "s/$regex/\2|/p"`
ips=`cat $1 | sed -rn "s/$regex/\3|/p"`

echo -e "[+]\e[32mMost used usernames\e[0m" 
echo $users | tr "|" "\n" | sort | uniq -c | sort -nr | awk '{print $2"\t\t" $1}' | head -5
printf "\n"

echo -e "[+]\e[32mMost common ips\e[0m" 
echo $ips | tr "|" "\n" | sort | uniq -c | sort -nr | awk '{print $2 "\t" $1}' | head -5
printf "\n"
today=$(LC_TIME=en_US date|awk '{print $2,$3}')
echo -n -e "[+]\e[32mNumber of today ("$today") failed attempts:\e[0m " && export B=$(LC_TIME=en_US date|awk '{print $2,$3}') && cat $1|grep -Ff<(echo $today)|grep Invalid|wc -l

yesterday=$(LC_TIME=en_US date -d "yesterday"|awk '{print $2,$3}')
echo -n -e "[+]\e[32mNumber of yesterday ("$yesterday") failed attempts:\e[0m " && export B=$(LC_TIME=en_US date -d "yesterday"|awk '{print $2,$3}') && cat $1|grep -Ff<(echo $yesterday)|grep Invalid|wc -l
printf "\n"

echo -n -e "[+]\e[32mTotal number of successful attempts:\e[0m " && cat $1|grep Accepted|wc -l
printf "\n"
echo -n -e "[+]\e[32mMost common countries...\e[0m"
printf "\n"
echo $ips | tr "|" "\n" | awk '{print $1}' | xargs -n1 geoiplookup | awk '{print $5}' | sort | uniq -c | sort -nr | awk '{print $2 " \t" $1}' | head -5
printf "\n"
