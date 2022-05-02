public with sharing class FetchRecordLists {
    @AuraEnabled(cacheable=true)
    public static List<ProductTransfer> fetchProductTransfers(String productId){
        List<ProductTransfer> prodTransfersList = new List<ProductTransfer>();
            prodTransfersList = [SELECT Id,Product2Id,Product2.Name, ReceivedBy.Name, QuantityReceived, SourceLocation.Name,CreatedDate 
                                 FROM ProductTransfer WHERE Product2Id =:productId ];
        return prodTransfersList;
    }
}