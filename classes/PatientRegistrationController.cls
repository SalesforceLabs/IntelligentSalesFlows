public with sharing class PatientRegistrationController {
    @AuraEnabled(cacheable = true)
    public static recordsWrapper getContacts(String queryTerm, Integer limitSize, Integer offset){
        try {
            string strQuery = 'SELECT Id, Name, PersonEmail, PersonBirthdate, Account.Owner.Name, Account.Website, PersonMobilePhone FROM Account';
            
            String regex = '[0-9]{0,2}/[0-9]{0,2}/[0-9]{4}'; // for BirthDate
            Pattern datePattern = Pattern.compile(regex);   
            Matcher matchDate = datePattern.matcher(String.escapeSingleQuotes(queryTerm));
            
            if(string.isNotBlank(queryTerm) && !matchDate.matches()){
                String searchKey = '%' + queryTerm  + '%';
                strQuery += ' WHERE IsPersonAccount = TRUE AND (Name LIKE : searchKey OR FirstName LIKE : searchKey OR LastName LIKE : searchKey OR PersonEmail LIKE : searchKey)';
            }
            else if(matchDate.matches()){
                strQuery += ' WHERE IsPersonAccount = TRUE AND (PersonBirthdate ='+Date.parse(queryTerm)+')';
            }
            
            strQuery += ' ORDER BY CreatedDate DESC LIMIT '+limitSize+' OFFSET '+offset;
            
            SObjectAccessDecision securityDecision = Security.stripInaccessible(AccessType.READABLE, Database.Query(strQuery));
            recordsWrapper recWrapper = new recordsWrapper();
            recWrapper.records = securityDecision.getRecords();
            
            return recWrapper;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        } 
    }
    
    public class recordsWrapper{
        @AuraEnabled public List<SObject> records;
        @AuraEnabled public Integer totalRecords;
    }
}