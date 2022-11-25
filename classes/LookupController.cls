public with sharing class LookupController {
    @AuraEnabled(cacheable=true)
    public static list<sObject> fetchLookupData(string searchKey , string sObjectApiName, String accountId) {    
        List < sObject > returnList = new List < sObject > ();
        string sWildCardText;
        string sQuery;  
        String accountRecordTypeName = 'Business';
        sWildCardText = '%' + searchKey + '%';
        if(sObjectApiName == 'Account'){
            sQuery = 'Select Id,Name,RecordType.Name  From ' + sObjectApiName + ' WHERE RecordType.Name =:accountRecordTypeName AND  Name Like : sWildCardText order by createdDate DESC LIMIT 5';            
        }else if(sObjectApiName == 'Contact'){
            sQuery = 'Select Id,Name,AccountId  From ' + sObjectApiName + ' WHERE AccountId=:accountId AND  Name Like : sWildCardText order by createdDate DESC LIMIT 5';            
        }else if(string.isNotBlank(sWildCardText)){
            sQuery = 'Select Id,Name From ' + String.escapeSingleQuotes(sObjectApiName) + ' WHERE Name Like : sWildCardText order by createdDate DESC LIMIT 5';                        
        }else{
            sQuery = 'Select Id,Name From ' + String.escapeSingleQuotes(sObjectApiName) + ' WHERE LastViewedDate != NULL ORDER BY   LastViewedDate DESC LIMIT 5';                        
        }
        for (sObject obj: database.query(sQuery)) {
            returnList.add(obj);
        }
        return returnList;
    }
    
    // Method to fetch lookup default value 
    @AuraEnabled(cacheable=true)
    public static sObject fetchDefaultRecord(string recordId , string sObjectApiName) {
        return database.query('Select Id, Name From ' + String.escapeSingleQuotes(sObjectApiName) + ' Where Id = : recordId LIMIT 1');
    }
}