public with sharing class MarkForOrderController {
    @AuraEnabled(cacheable = true)
    public static recordsWrapper getOrders(String queryTerm, Integer limitSize, Integer offset, Date fromDate, Date toDate){
        try {
            string strCountQuery = 'SELECT count() FROM Order';
            string strQuery = 'SELECT Id, OrderNumber, Createddate, AccountId, Account.Name, Status, TotalAmount, EffectiveDate, Pricebook2Id FROM Order';
            
            if(string.isNotBlank(queryTerm)){
                String searchKey = '\'%' + String.escapeSingleQuotes(queryTerm)  + '%\'';
                strCountQuery += ' WHERE (Account.Name LIKE '+searchKey+' OR Status LIKE '+searchKey+' OR OrderNumber LIKE '+searchKey+')';
                strQuery += ' WHERE (Account.Name LIKE '+searchKey+' OR Status LIKE '+searchKey+' OR OrderNumber LIKE '+searchKey+')';
            }
            
            if(fromDate!=null && toDate!=null){
                string frmDt = string.valueOf(fromDate).substring(0,10);
                string toDt =  string.valueOf(toDate).substring(0,10);
                strQuery += ' AND DAY_ONLY(Createddate) >= '+frmDt+' AND DAY_ONLY(Createddate) <= '+toDt;
                strCountQuery += ' AND DAY_ONLY(Createddate) >= '+frmDt+' AND DAY_ONLY(Createddate) <= '+toDt;
            }
            
            strQuery += ' ORDER BY CreatedDate DESC LIMIT:limitSize OFFSET:offset';
            
            recordsWrapper recWrapper = new recordsWrapper();
            recWrapper.records = Database.Query(strQuery);
            recWrapper.totalRecords = Database.countQuery(strCountQuery);
            
            return recWrapper;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable = true)
    public static recordsWrapper getVisits(String queryTerm, String accountId, Integer limitSize, Integer offset){
        try {
            string strCountQuery = 'SELECT count() FROM Visit';
            string strQuery = 'SELECT Id, Name, AccountId, Account.Name, ContactId, Contact.Name, VisitTypeId, VisitType.Name, LocationId, Location.Name, Status, VisitPriority, PlannedVisitStartTime, PlannedVisitEndTime FROM Visit';
            
            if(string.isNotBlank(queryTerm) || string.isNotBlank(accountId)){
                string frmDt = string.valueOf(system.today()).substring(0,10);
                system.debug('frm'+frmDt);
                String searchKey = '\'%' + String.escapeSingleQuotes(queryTerm)  + '%\'';
                strCountQuery += ' WHERE AccountId =: accountId AND DAY_ONLY(CreatedDate) <= '+frmDt +' AND (Account.Name LIKE '+searchKey+' OR Location.Name LIKE '+searchKey+')';
                strQuery += ' WHERE AccountId =: accountId AND DAY_ONLY(CreatedDate) <= '+frmDt +' AND (Account.Name LIKE '+searchKey+' OR Location.Name LIKE '+searchKey+')';
            }
            
            strQuery += ' ORDER BY CreatedDate DESC LIMIT '+limitSize+' OFFSET '+offset;
            system.debug('frm'+strQuery);
            recordsWrapper recWrapper = new recordsWrapper();
            recWrapper.records = checkForPermissions(Database.Query(strQuery));
            recWrapper.totalRecords = Database.countQuery(strCountQuery);
            return recWrapper;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(Cacheable=true)
    public static List<Schema.Location> getRelatedFulfillmentLocations(String accId){
        return (List<Schema.Location>) checkForPermissions([Select Id,Name, IsInventoryLocation  FROM Location WHERE Id IN (SELECT FulfillmentLocationId  FROM ProductFulfillmentLocation WHERE AccountId =:accId) AND IsInventoryLocation=true]);
    }
    
    @AuraEnabled(Cacheable=true)
    public static List<Order> getOrderById(String orderId){
        return (List<Order>) checkForPermissions([SELECT Id, OrderNumber, Createddate, AccountId, Account.Name, Status, TotalAmount, EffectiveDate, Pricebook2Id FROM Order WHERE Id= : orderId]);
    }
    
    public static List<SObject> checkForPermissions(List<SObject> records){
        SObjectAccessDecision securityDecision = Security.stripInaccessible(
            AccessType.READABLE,
            records
        );
        return securityDecision.getRecords();
    }
    
    public class recordsWrapper{
        @AuraEnabled public List<SObject> records;
        @AuraEnabled public Integer totalRecords;
    }
}