public with sharing class CycleCountController {
    @InvocableMethod(label='Get Serialized Products' description='Get Serialized Products with filters ProductId,LocationId and ScannedSerailNumbers' category='SerializedProduct')
    Public static List<Response> getLostProducts(List<Requests> rqstInputs){
        try{
            if(rqstInputs == null) return new List<Response>();
            
            string productId = rqstInputs[0]?.ProductId;
            string locationId = rqstInputs[0]?.LocationId;
            List<string> scannedSerialNumbers = new List<string>();
            
            if(rqstInputs[0]?.ScannedSerialNumbers != null)
                ScannedSerialNumbers.addAll(rqstInputs[0]?.ScannedSerialNumbers);
            
            return new List<Response>{ 
                new Response([SELECT 
                              Id,
                              Name,
                              Product2Id,
                              SerialNumber,
                              ProductItemId 
                              FROM 
                              SerializedProduct 
                              WHERE 
                              Status IN ('Available')
                              AND Product2Id =: ProductId
                              AND ProductItem.Product2Id =: productId
                              AND ProductItem.LocationId =: locationId
                              AND SerialNumber NOT IN: scannedSerialNumbers
                              Order By SerialNumber ASC
                             ])};
                                 
                                 }catch(Exception e){
                                     throw new CycleCountControllerException(e.getMessage());
                                 }
    }
    
    public class CycleCountControllerException Extends Exception{}
    
    public class Requests {
        @InvocableVariable(label='ProductId' description='ProductId will passed as Input Parameter to filter Serialized Products')
        public String ProductId;
        
        @InvocableVariable(label='LocationId' description='LocationId will passed as Input Parameter to filter Serialized Products')
        public String LocationId;  
        
        @InvocableVariable(label='ScannedSerialNumbers' description='ScannedSerialNumbers will passed as Input Parameter to filter Serialized Products')
        public List<string> ScannedSerialNumbers;  
    }
    
    public class Response {
        @InvocableVariable(label='SerializedProducts' description='Filtered SerializedProducts will be Returned.')
        public List<SerializedProduct> SerializedProducts;  
        
        Response(List<SerializedProduct> SerializedProducts){
            this.SerializedProducts = SerializedProducts;
        }
    }
}