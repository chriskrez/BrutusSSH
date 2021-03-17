from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import json
import os.path
import re
import requests
import smtplib

MONTHS = {"Jan":"01", "Feb":"02", "Mar":"03", "Apr":"04", "May":"05", "Jun":"06", "Jul":"07", "Aug":"08", "Sep":"09", "Oct": "10", "Nov": "11", "Dec": "12"}

def readDefaults():
    if os.path.isfile("./emailDefaults.json"):
        with open("emailDefaults.json") as defFile:
            data = json.load(defFile)
            global LOG_PATH, TIME_WINDOW, THRESHOLD, EMAIL_RECEIVER
            LOG_PATH = data["log_path"]
            TIME_WINDOW = int(data["time_window"])
            THRESHOLD = int(data["threshold"])
            EMAIL_RECEIVER = data["email_receiver"]
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

            if "Invalid user" in line or "Failed password for root" in line:
                counter += 1
                reg = re.compile("from (.*) port")
                ip = reg.search(line).group(1)
                if ip in ips:
                    ips[ip] += 1
                else:
                    ips[ip] = 1

        if counter >= THRESHOLD:
            post = []
            for ip in sorted(ips.items(), key=lambda x: x[1], reverse=True):
                post.append({"query": ip[0], "fields": "country,query"})
            res = requests.post("http://ip-api.com/batch", json=post)
            sendMail(ips, res.text, counter)

def sendMail(ips, res, counter):
    smtpObj = smtplib.SMTP('localhost')
    message = MIMEMultipart('alternative')
    message['From'] = "info@brutus.ml"
    message['To'] = EMAIL_RECEIVER
    message['Subject'] = "BrutusSSH Attack Notification"

    countries = {}
    records = ""
    for entry in json.loads(res):
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
    smtpObj.send_message(message)

if __name__ == "__main__":
    readDefaults()
    checkAttack()
