from datetime import datetime
import csv
import json

textCSV = "text21.csv"
imageCSV = "imagept21.csv"

def read_csv_file(filename):
	if (filename[(len(filename)-4):] != ".csv"):
		print("[ERROR] '" + filename + "' is not a .csv file!")
		return
	
	try:
		users = []
		with open(filename, "r") as file:
			csv_reader = csv.reader(file)
			prevUser = ""
			for row in csv_reader:
				if (row[1] != prevUser):
					data = {}
					data['id'] = row[1]
					data['scheme'] = "Text21" if (row[3] == "testtextrandom") else "Image21"
					data['logins'] = {}
					data['logins']['success'] = []
					data['logins']['failure'] = []
					users.append(data)
					prevUser = row[1]
			
			startTime = user = 0
			file.seek(0)
			for row in csv_reader:
				if (user < len(users)):
					if (row[1] != users[user]['id']):
						user += 1
					if (row[5] == "enter" and row[6] == "start"):
						startTime = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
					elif (row[5] == "login"):
						attempt = row[6] # failure or success
						endTime = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
						time = endTime - startTime
						users[user]['logins'][attempt].append(time.seconds)
		return json.dumps(users, indent=4)
	except IOError:
		print("[ERROR] Could not find the file '" + filename + "' in the same directory as the script!")
		return 1

def create_csv_file(data):
	with open("data-output.csv", "w", newline="") as file:
		csv_writer = csv.writer(file)
		csv_writer.writerow(["userid", "pwd scheme", "total logins", "successful logins", "unsuccessful logins", "avg login time success (s)", "avg login time failed (s)"])
		for entry in data:
			avg_success = 0
			avg_failure = 0
			if (len(entry["logins"]["success"]) > 0):
				avg_success = round(sum(entry["logins"]["success"]) / len(entry["logins"]["success"]), 2)
			if (len(entry["logins"]["failure"]) > 0):
				avg_failure = round(sum(entry["logins"]["failure"]) / len(entry["logins"]["failure"]), 2)
			csv_writer.writerow([entry["id"], entry["scheme"], len(entry["logins"]["success"]) + len(entry["logins"]["failure"]), len(entry["logins"]["success"]), len(entry["logins"]["failure"]), avg_success, avg_failure])

data = read_csv_file(textCSV)
data2 = data + read_csv_file(imageCSV)
print(read_csv_file(imageCSV))