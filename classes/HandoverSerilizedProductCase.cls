public with sharing class HandoverSerilizedProductCase {
    
    @InvocableMethod(label='Handover serilized Product from Case' description='Create case Mapping with serialized products' category='GnrcVstKeyPerformanceInd')
    public static List<Response> getRecordsForKPIs(List<Requests> rqstInputs){
        try{
            //input varaibles from flow
            string productId = rqstInputs[0]?.productId;
            string caseId = rqstInputs[0]?.caseId;
            String type = rqstInputs[0]?.type;
            List<string> serialnumbersList = rqstInputs[0]?.serialnumbersList;
            List<Generic_Case_KPI__c> gencaseKpisList = new List<Generic_Case_KPI__c>();
            
            for(String srno: serialnumbersList){
                if(srno != null && srno != ''){
                    Generic_Case_KPI__c genCasKPI = new Generic_Case_KPI__c();
                    genCasKPI.SerialNumber__c = srno;
                    genCasKPI.Case__c=caseId;
                    genCasKPI.Product__c=productId;
                    genCasKPI.Type__c = type;
                    gencaseKpisList.add(genCasKPI);  
                }
                
                System.debug('-->srNo'+srno);
            }
            System.debug('-->'+gencaseKpisList);
            //send updated list to flow and flow will update the records
            List<Response> results = new List<Response>();
            Response objResponse = new Response();
            objResponse.genericCaseKpis = gencaseKpisList;  
            results.add(objResponse);
            
            return results;
        }catch(Exception e){
            throw new ReturnProductKPIDetailsException(e.getMessage());
        }
    }
    public class ReturnProductKPIDetailsException Extends Exception{}
    
    public class Requests {
        @InvocableVariable
        public List<String> serialnumbersList;
        @InvocableVariable
        public String caseId;
        @InvocableVariable
        public String productId;
        @InvocableVariable
        public String type;
        
    }
    
    Public Class Response{
        @InvocableVariable
        public List<Generic_Case_KPI__c > genericCaseKpis;  
    }
    
}