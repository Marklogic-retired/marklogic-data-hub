import json
case_list = {}
for i in range(1,1001):
    for j in range(1,501):
        case_list['prop'+str(j)] = 'value'+str(i)+'-'+str(j)
    jsonString = json.dumps(case_list, indent= 10)
    #print("json"+str(i))
    #print(jsonString)
    with open('MultipleProperties'+str(i)+'.json', 'w') as outfile:
        outfile.write(jsonString)