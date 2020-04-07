from datetime import datetime
import csv

# the names of the csv files we will be opening
textCSV = "text21.csv"
imageCSV = "imagept21.csv"

# function that reads and parses a .csv file and returns an array
def read_csv_file(filename):
	if (filename[(len(filename)-4):] != ".csv"): # double check if the file the user wants to read is actually a .csv file
		print("[ERROR] '" + filename + "' is not a .csv file!")
		return
	try:
		users = [] # initialize the array that we will return
		with open(filename, "r") as file: # open file to read line by line
			csv_reader = csv.reader(file) # all the lines in the csv file
			prevUser = "" # initialize previous user as empty string
			for row in csv_reader: # iterate through each line
				if (row[1] != prevUser):  # if user name at the current row is different from the previous user
					# create a JSON object in the format specified for each user and append to the users array
					data = {}
					data['id'] = row[1]
					data['scheme'] = "Text21" if (row[3] == "testtextrandom") else "Image21"
					data['logins'] = {}
					data['logins']['success'] = []
					data['logins']['failure'] = []
					users.append(data)
					prevUser = row[1] # update the previous user to current user
			
			startTime = user = 0 # initialize starTime and user at 0
			file.seek(0) # seek the file reader back to the first line
			for row in csv_reader: # iterate through the file line by line again
				if (user < len(users)): # as long as we haven't gone through all the users in our list
					if (row[1] != users[user]['id']): # if the user name at the current row is different from the current user we are evaluating then update the index
						user += 1
					if (row[5] == "enter" and row[6] == "start"): # if the user is about to start entering their password
						startTime = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S") # update the startTime to the value of the current row's date time
					elif (row[5] == "login"): # if the user either failed or succeeded in inputting their password
						attempt = row[6] # failure or success
						endTime = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S") # calculate how long it took the user to input their password
						time = endTime - startTime
						users[user]['logins'][attempt].append(time.seconds) # append the time it took to either the success or failure list that was created for each user but for the current user
		return users # the list containing the parsed data
	except IOError: # if the program catchs an error opening the file then it must mean that its not located in the current directory the script is being executed
		print("[ERROR] Could not find the file '" + filename + "' in the same directory as the script!")
		return 1

# function that creates a csv file in the format that was requested by the assignment spec
def create_csv_file(data):
	with open("data-output.csv", "w", newline="") as file: # open file for write operations
		csv_writer = csv.writer(file)
		# write the first row which consists of the column names
		csv_writer.writerow(["userid", "pwd scheme", "total logins", "successful logins", "unsuccessful logins", "avg login time success (s)", "avg login time failed (s)"])
		for entry in data: # iterate through each data entry thats passed in the parameter
			# calculate the average of success and failures each user had
			avg_success = 0
			avg_failure = 0
			if (len(entry["logins"]["success"]) > 0): # error check in case divide by zero
				avg_success = round(sum(entry["logins"]["success"]) / len(entry["logins"]["success"]), 2)
			if (len(entry["logins"]["failure"]) > 0): # error check in case divide by zero
				avg_failure = round(sum(entry["logins"]["failure"]) / len(entry["logins"]["failure"]), 2)
			# write the line in the format that has been established
			csv_writer.writerow([entry["id"], entry["scheme"], len(entry["logins"]["success"]) + len(entry["logins"]["failure"]), len(entry["logins"]["success"]), len(entry["logins"]["failure"]), avg_success, avg_failure])

# read both files and concatinate the arrays in order to pass the data and create 1 csv file
textData = read_csv_file(textCSV)
create_csv_file(textData + read_csv_file(imageCSV))