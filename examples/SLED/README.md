# SLED MES Demo

## How to install
To install via Gradle, first initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

	./gradlew hubInit
	
To Update via Gradle, first initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

	./gradlew hubUpdate

To Quick Install via Gradle, first initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

	./gradlew install

## Scenario

This project is regarding Medicare claims which contains variety of data coming from different systems in different formats as follows  

 1. **Patients Claims** that are in Health care standard 837 which is in CSV format
 2. **Member Data** nothing but the patients Data that are coming from two different systems MMIS(Medicate Management Information System) which is a relational system in csv format and CURAM which is and older systems that is main frame based system in xml format
 3. **Member Id card** images that arre in png format which is unstructured data
 4. **Providers data** data regarding physicians in csv format
 
There are three different types of Users:

 1. **DrSmith** Doctor with PII reading permission
 2. **MrJones** PII reading permission with Redacton
 3. **MrNoPii** No PII reading
 
 The readaction rules are mentioned in redactionRules2Roles.json
 
Entities:

 1. **Member entity**: Member can have one or more claims and can have a self join where primary member can have dependent member as well.
 2. **ClaimFHIR entity**: Claim header can have claim line Items 
 3. **ClaimItems entity**: Any claim item can be serviced by a provider
 4. **Provider entity**: Providers are the physicians
 
## Predefined Flows

The project has flows predefined for integrating the Member data and claims.

- **Curam**: Has steps for ingesting and mapping Member data from CURAM system.
- **Mmis**: Has steps for ingesting and mapping Member data from MMIS system.
- **Claims**: Has steps for ingesting and mapping Claims Header and Claim Items data.
- **ProviderData**: Has steps for ingesting and mapping Provider data.
- **Mastering**: Has a mastering step for matching and merging duplicate data across the systems.

## How to Integrate the Data

1. View the `Curam` flow.
2. Ingest the datasets under data/Member-CURAM by running the `ingestCuram` step. This ingests 4 Member documents into the staging database. You can view the documents in the Browse Data view.
3. With the Member data ingested, view the `mapCuram` step to see the mapping expressions that have been configured.
4. Run the `mapCuram` step in the `Curam` flow. This harmonizes the 4 member documents into the final database. You can view the documents in the Browse Data view.
5. View the `Mmis` flow.
6. Ingest the datasets under data/Member-MMIS by running the `loadMMIS` step. This ingests 132 Member documents into the staging database. You can view the documents in the Browse Data view.
7. With the Member data ingested, view the `mapMMIS` step to see the mapping expressions that have been configured.
8. Run the `mapMMIS` step in the `Mmis` flow. This harmonizes the 132 member documents into the final database. You can view the documents in the Browse Data view.
9. View the `Claims` flow.
10. Ingest the datasets under data/claims by running the `loadClaims` step. This ingests 1,004 claim documents into the staging database. You can view the documents in the Browse Data view.
11. With the Claims data ingested, view the `HarmonizeClaims` step to see the mapping expressions that have been configured.
12. Run the `HarmonizeClaims` step in the `Claims` flow. This harmonizes the 1,004 claim documents into the final database. You can view the documents in the Browse Data view.
13. Run the `HarmonizeClaimItems` step in the `Claims` flow. This harmonizes the 6,004 claim documents into the final database. You can view the documents in the Browse Data view.
14. View the `ProviderData` flow.
15. Ingest the datasets under data/ProviderData by running the `IngestProvider` step. This ingests 1,004 Member documents into the staging database. You can view the documents in the Browse Data view.
16. With the Provider data ingested, view the `MapProvider` step to see the mapping expressions that have been configured.
17. Run the `MapProvider` step in the `ProviderData` flow. This harmonizes the 1,004 member documents into the final database. You can view the documents in the Browse Data view.
18. Run the `matchMember` step and then `mergeMember` step in `Mastering` flow to master the Member, Claims and Provider data. This merges documents in the final database. You can view the results in the Browse Data view resulting in 123 mastered records.

## Example Member Data

 Search for Drindy in Final Database from explorer tab

```
"instance": {
      "info": {
        "title": "Member",
        "version": "0.0.1",
        "baseUri": "http://marklogic.com/envision/",
        "description": "Member Entity Final DB"
      },
      "Member": {
        "MiddleName": "M",
        "idCard": "/images/member-id-card.png",
        "FullName": [
          "Drindi Day ",
          "Day Drindy ",
          "Drindy Day "
        ],
        "FirstLastNameSorted": [
          "Day,Drindi",
          "Day,Drindy"
        ],
        "DayOfDOB": "27",
        "LastName": "Day",
        "DataSource": "MMIS",
        "SourceFormat": "CSV",
        "MonthOfDOB": "01",
        "Race": "Hispanic",
        "YearOfDOB": "1994",
        "origQuadrant": "NE",
        "Gender": "Female",
        "ScenarioDesc": "Variations in name spellings, Middle Name conflated with First name, Last name conflated with First name",
        "Zip5": "20051",
        "origAddress1": "744 28th Street",
        "memberID": "10045373723596171140",
        "DOB": "1/27/1994",
        "FullAddress": "744 28th Street, ,",
        "Zip4": "2332",
        "uid": "n64c49bbe17386856",
        "SSN": "114-98-3748",
        "FirstName": "Drindi",
        "Quadrant": "NE",
        "Address1": "744 28th Street",
        "ScenarioNumber": "Scenario5"
      }
    }
```