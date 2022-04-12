/********************************************************
    Class Name: FetchRecordLists
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Class is used to get the related records 
    for the given account.
    ********************************************************/
public with sharing class FetchRecordLists{
    
        /*
    Method: PicklistOptionsController
    Developer : Abdul(PWC)
    Date: 07/03/2022
    Description: This Method is used to get the record values of the opportunities
    related to the account
    */
    
    @AuraEnabled(cacheable = true)
    public static List<Opportunity> fetchRelatedOpps(String accId,Integer limitSize, Integer offset){
        return [Select Id,Name,AccountId,Account.Name,Amount, CloseDate, StageName from opportunity WHERE AccountId=:accId ORDER BY CreatedDate LIMIT:limitSize OFFSET:offset];
    }
    @AuraEnabled(cacheable = true)
    public static List<Case> fetchCaseRequests(String status, String type, Integer limitSize, Integer offset){
        return [Select Id,Account.Name,AccountId, ContactId ,Status,Type,Subject,ProductId,Product.Name,Location__r.Name,Location__c,Requested_Date__c,Quantity__c, From_Date__c ,To_Date__c, Contact.Name  FROM Case WHERE Status=:status AND Type=:type ORDER BY CreatedDate LIMIT:limitSize OFFSET:offset];
    }
    
    @AuraEnabled(cacheable = true)
    public static List<ProductFulfillmentLocation> getProductLocations(string accountId, string productId){
        return [SELECT Id, ProductId, Name, LocationId, Location.Name, FulfillmentLocationId, Account.Name FROM ProductFulfillmentLocation WHERE accountId=: accountId AND ProductId= :productId];
    }
    
    @AuraEnabled(cacheable = true)
    public static recordsWrapper getOrders(String queryTerm, Integer limitSize, Integer offset){
        try {
            string strCountQuery = 'SELECT count() FROM Order';
            string strQuery = 'SELECT Id, OrderNumber, AccountId, Account.Name, Status, TotalAmount, EffectiveDate FROM Order';
            
            if(string.isNotBlank(queryTerm)){
                String searchKey = '\'%' + String.escapeSingleQuotes(queryTerm)  + '%\'';
                strCountQuery += ' WHERE (Account.Name LIKE '+searchKey+' OR Status LIKE '+searchKey+')';
                strQuery += ' WHERE (Account.Name LIKE '+searchKey+' OR Status LIKE '+searchKey+')';
            }
            
            strQuery += ' ORDER BY CreatedDate DESC LIMIT:limitSize OFFSET:offset';
            
            recordsWrapper recWrapper = new recordsWrapper();
            recWrapper.records = Database.Query(strQuery);
            recWrapper.totalRecords = Database.countQuery(strCountQuery);
            return recWrapper;
        } catch (QueryException e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable = true)
    public static recordsWrapper getVisits(String queryTerm, String accountId, Integer limitSize, Integer offset){
        try {
            string strCountQuery = 'SELECT count() FROM Visit';
            string strQuery = 'SELECT Id, Name, AccountId, Account.Name, ContactId, Contact.Name, VisitTypeId, VisitType.Name, LocationId, Location.Name, Status, VisitPriority, PlannedVisitStartTime, PlannedVisitEndTime FROM Visit';
            
            if(string.isNotBlank(queryTerm) || string.isNotBlank(accountId)){
                String searchKey = '\'%' + String.escapeSingleQuotes(queryTerm)  + '%\'';
                strCountQuery += ' WHERE AccountId =:accountId AND (Account.Name LIKE '+searchKey+' OR Location.Name LIKE '+searchKey+')';
                strQuery += ' WHERE AccountId =:accountId AND (Account.Name LIKE '+searchKey+' OR Location.Name LIKE '+searchKey+')';
            }
            
            strQuery += ' ORDER BY CreatedDate DESC LIMIT:limitSize OFFSET:offset';
            
            recordsWrapper recWrapper = new recordsWrapper();
            recWrapper.records = Database.Query(strQuery);
            recWrapper.totalRecords = Database.countQuery(strCountQuery);
            return recWrapper;
        } catch (QueryException e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    public class recordsWrapper{
        @AuraEnabled public List<SObject> records;
        @AuraEnabled public Integer totalRecords;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<SerializedProduct> fetchSerilizedProducts(){
        return [SELECT Id, ProductItemId, Product2Id, Status,SerialNumber FROM SerializedProduct ];
    }
}