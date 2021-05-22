from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import json
import os.path
import re
import requests
import smtplib
import math

MONTHS = {"Jan":"01", "Feb":"02", "Mar":"03", "Apr":"04", "May":"05", "Jun":"06", "Jul":"07", "Aug":"08", "Sep":"09", "Oct": "10", "Nov": "11", "Dec": "12"}

def checkExistingFKey(file, key):
    try:
        return file[key]
    except:
        print("-- Missing value from emailDefaults.json")
        print("-- Please fill the value {}".format(key))
        return

def readDefaults():
    if os.path.isfile("./emailDefaults.json"):
        with open("emailDefaults.json") as defFile:
            data = json.load(defFile)
            global LOG_PATH, TIME_WINDOW, THRESHOLD, EMAIL_RECEIVER
            LOG_PATH = checkExistingFKey(data, "log_path")
            TIME_WINDOW = int(checkExistingFKey(data, "time_window"))
            THRESHOLD = int(checkExistingFKey(data, "threshold"))
            EMAIL_RECEIVER = checkExistingFKey(data, "email_receiver")
    else:
        content = {
            "log_path":"/var/log/auth.log",
            "time_window":"5",
            "threshold": "50",
            "email_receiver": "example@example.com"
        }

        print("Please fill the default values in emailDefaults.json")
        with open('emailDefaults.json', 'w') as defaults:
            json.dump(content, defaults)
        return

def checkAttack():
    with open(LOG_PATH, "r") as logs:
        now = datetime.now() - timedelta(minutes=TIME_WINDOW)
        flag = False
        ips = {}
        counter = 0
        while True:
            line = logs.readline()
            if not line:
                break

            if not flag:
                time = re.split('\s+',line)[:3]
                time = f"{now.year} {MONTHS[time[0]]} {' '.join(time[1:])}"
                date = datetime.strptime(time, "%Y %m %d %H:%M:%S")
                if date >= now:
                    flag = True
                else:
                    continue
            
            regex = re.compile("Failed password for(?: invalid user)? (.+) from (\\d+\\.\\d+\\.\\d+\\.\\d+).*")
            regexRes = regex.search(line)
            if regexRes:
                counter += 1
                ip = regexRes.group(2)
                if ip in ips:
                    ips[ip] += 1
                else:
                    ips[ip] = 1

        if counter == 0:
            print("-- No matching failed login attempts")
            return

        if counter >= THRESHOLD:
            print("-- Threshold exceeded")
            iterations = math.ceil(len(ips.items()) / 100)
            results = []

            for i in range(iterations):
                minV = 100 * i
                maxV = min(100 * (i + 1), len(ips.items()))
                post = []
                for x in list(ips)[minV:maxV]:
                    post.append({"query": x, "fields": "country,query"})
            
                res = requests.post("http://ip-api.com/batch", json=post)
                try:
                    for entry in json.loads(res.text):
                        results.append(entry)
                except:
                    print("-- Something went wrong while fetching countries from http://ip-api.com")
                    print("-- Try again later")
                    return

            results.sort(key=lambda x: ips[x["query"]], reverse=True)
            sendMail(ips, results, counter)
        else:
            print("-- Threshold not exceeded")
            print("-- Failed attempts: {}, Threshold: {}".format(counter, THRESHOLD))

def sendMail(ips, res, counter):
    print("-- Sending email!")

    try:
        smtpObj = smtplib.SMTP('localhost')
    except ConnectionRefusedError as er:
        print("-- Something went wrong!")
        print("-- {}".format(er))
        print("-- Make sure the docker-compose provided is up and running the smtp_relay")
        return

    message = MIMEMultipart('alternative')
    message['From'] = "info@brutus.ml"
    message['To'] = EMAIL_RECEIVER
    message['Subject'] = "BrutusSSH Attack Notification"

    countries = {}
    records = ""
    for entry in res:
        country = entry["country"]
        ip = entry["query"]
        attempts = ips[ip]
        if country in countries:
            countries[country] += attempts
        else:
            countries[country] = attempts

        records += """\
            <tr>
                <td>{ip}</td>
                <td>{country}</td>
                <td>{attempts}</td>
            </tr>
        """.format(ip=ip, country=country, attempts=attempts)

    topCountry = sorted(countries.items(), key=lambda x: x[1], reverse=True)[0]
    html = """\
    <html>
    <body>
        <div style="text-align: center;">
            <img src="cid:logo" style="width: 256px; height: 256px;">
        </div>
        <p>
            We are sending you this email to inform you that an <strong> attack to your server </strong> has been
            identified. Below you can see the details that were extracted.

        </p>
        <p>
            In the last <strong> {time} </strong> minutes there have been 
            <strong> {attempts} </strong> failed login attempts from 
            <strong> {distinct} </strong> distinct hosts. The most common country of origin was
            <strong> {country} </strong> with <strong> {c_attempts} </strong> attempts.
        </p>
        <table style="width:100%">
            <tr>
                <th style="text-align:left">IP Address</th>
                <th style="text-align:left">Country</th> 
                <th style="text-align:left">Attempts</th>
            </tr>
            {records}
        </table>
    </body>
    </html>
    """.format(time=TIME_WINDOW, attempts=counter, records=records, distinct=len(ips), country=topCountry[0], c_attempts=topCountry[1])

    part = MIMEText(html, "html")
    message.attach(part)

    fp = open('logo.png', 'rb')
    image = MIMEImage(fp.read())
    fp.close()

    image.add_header('Content-ID', '<logo>')
    message.attach(image)

    try:
        smtpObj.send_message(message)
        print("-- Email sent successfully!")
    except smtplib.SMTPResponseException as er:
        eCode = er.smtp_code
        eMessage = er.smtp_error
        print("-- Something went wrong!")
        print("-- Error code: {}".format(eCode))
        print(eMessage)
        return
    except smtplib.SMTPRecipientsRefused as er:
        print("-- Something went wrong!")
        print("-- Make sure the email provided on emailDefaults.json is correct")
        return


if __name__ == "__main__":
    readDefaults()
    checkAttack()
