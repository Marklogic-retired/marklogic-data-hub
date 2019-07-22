# Data Hub Many-To-One Example: Integrating Patient Hub 

This example project will demonstrate, how we can use custom steps to integrate data from multiple sources into one.

## Scenario

- Patient Hub project has four entities `Diagnoses`, `Labs`, `Admissions` and `Patients`. Diagnoses and Labs entity needs to be integrated with Admissions and finally Admissions entity needs to be integrated with Patients. This is a many-to-one use case, where we want to integrate data from multiple entities into a final one called `Patients`.
- After harmonization, `Patients` entity should have 
    - all the properties from `Patients` entity
    - startDate, endDate, Labs and Diagnoses fom `Admissions` entity

## How to install

To try this project out using QuickStart, start with a clean MarkLogic instance - i.e. without an existing Data hub installation.
Then, you can either install this project's application via QuickStart or via Gradle.

### Install via QuickStart

To install via QuickStart, simply start QuickStart and browse to this project folder. Use QuickStart to initialize
this project and then deploy the application.

### Install via Gradle

To install via Gradle, first initialize the project:

    ./gradlew -i hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 

Then deploy the application:

    ./gradlew -i mlDeploy

Next, start up QuickStart and browse to this project folder and login to QuickStart. 

## Predefined Flows

The project has flows predefined for integrating the patients' data.

- **Diagnoses**: Has a step for ingesting all the patients' diagnosis dataset.
- **Labs**: Has a step for ingesting all the patients' labs dataset.
- **Admissions**: Has an ingestion step to ingest all the admissions dataset and a custom step to integrate `Labs` and `Diagnoses` entities with `Admissions`.
- **Patients**: Has an ingestion step to ingest all the patients' dataset and a custom step to integrate the harmonized `Admissions` entity with `Patients`.

## How to Integrate the Patient Hub

1. Run the `Diagnoses` flow. This ingests Diagnoses documents into the staging database. You can view the documents in Browse Data view for Staging.
1. Run the `Labs` flow. This ingests Labs documents into the staging database. You can view the documents in Browse Data view for Staging.
1. Run the `Admissions` flow. It will run two steps, one for ingesting Admissions documents and a custom step to harmonize them with `Diagnoses` and `Labs` entities, into the staging database. The custom step searches and harmonizes the Labs and Diagnoses instances that match a particular AdmissionID and PatientID. You can view the documents in Browse Data view for Staging. The harmonized `Admissions` entity instances start with the URI `/admissionsComplete`.
1. Run the `Patients` flow. It will run two steps, one for ingesting Patients documents into staging and a custom step to harmonize them with `Admissions` entity(harmonized in the previous step) into the final database. The custom step searches and harmonizes the Admissions instances that match a particular PatientID. You can view the documents in Browse Data view for Final. The harmonized `Patients` entity instances start with the URI `/patients/admissions`.


### Admissions Entity Instance (JSON)

```
{
    "instance": {
        "PatientID": "56A35E74-90BE-44A0-B7BA-7743BB152133",
        "AdmissionID": "2",
        "AdmissionStartDate": "2003-09-25 03:25:19.470",
        "AdmissionEndDate": "2003-10-11 16:54:53.707"
    }
}
```

### Admissions Entity Instance after Harmonization with Labs and Diagnoses Entities (JSON)

```
{
    "instance": {
        "Admission": {
            "AdmissionID": "2",
            "AdmissionStartDate": "1994-07-22 07:12:50.407",
            "AdmissionEndDate": "1994-07-28 12:29:05.827",
            "Diagnoses": [{"Diagnosis": {...}}],
            "Labs": [{"Lab": {...}},
                     {"Lab": {...}}]
        },
        "info": {
            "title": "Admission",
            "version": "0.0.1"
        }
    }
}
```

### Patients Entity Instance (JSON)

```
{
    "instance": {
        "PatientID": "BC44CE19-9FC5-4AC9-A296-9EBC5E3D03AE", 
        "PatientGender": "Female", 
        "PatientDateOfBirth": "1953-06-04 03:16:17.843", 
        "PatientRace": "African American", 
        "PatientMaritalStatus": "Married", 
        "PatientLanguage": "English", 
        "PatientPopulationPercentageBelowPoverty": "15.04"
    }
}
```

### Patients Entity Instance after Harmonization with Admissions Entity (JSON)

```
{
    "instance": {
        "Patient": {
            "Admissions": [
                {   "Admission": {
                        "AdmissionID": "1",
                        "AdmissionStartDate": "1967-06-02 08:43:45.987",
                        "AdmissionEndDate": "1967-06-14 09:59:12.247",
                        "Diagnoses": [{ "Diagnosis": {...} }],
                        "Labs": [{ "Lab": {...} },
                                 { "Lab": {...} }]
                    },
                    "info": {...}
                },
                {   "Admission": {...}},
                {   "Admission": {...}},
                {   "Admission": {...}}
            ],
            "PatientID": "E250799D-F6DE-4914-ADB4-B08A6E5029B9",
            "Gender": "Female",
            "DoB": "1945-08-04 19:03:00.757",
            "Race": "White",
            "Marital-status": "Single",
            "Language": "Unknown",
            "PercentageBelowPoverty": 12.86
        },
        "info": {
            "title": "Patient",
            "version": "0.0.1"
        }
    }
}
```
