import json
EntityName = "MultipleProperties"
EntityDescription = "Entity with hundreds of properties"
properties = {}
prop = {"datatype": "string",
          "facetable": False,
          "sortable": False,
          "collation": "http://marklogic.com/collation/codepoint"}
          
for j in range(1,501):
    properties['prop'+str(j)] = prop

mainDict = {"info":{"title": EntityName, "draft": False, "version": "1.0.0", "baseUri": "http://example.org/"}, 
"definitions": {EntityName:{"properties":properties, "description": EntityDescription}}}

jsonString = json.dumps(mainDict, indent= 5)
print(jsonString)

with open('MultipleProperties.entity.json', 'w') as outfile:
        outfile.write(jsonString)