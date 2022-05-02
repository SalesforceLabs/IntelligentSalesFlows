@isTest
public class MarkForOrderControllerTest {
    @testSetup static void setup() {
        try{
            List<Account> testAccts = new List<Account>();
            for(Integer i=0;i<2;i++) {
                testAccts.add(new Account(
                    Name = 'TestAcct'+i
                ));
            }
            insert testAccts;
            
            List<Product2> testProducts = new List<Product2>();
            for(Integer i=0; i<2; i++) {
                testProducts.add(new Product2(
                    Name = 'Thermometer'+i+i,
                    IsActive = true,
                    IsSerialized = true
                ));
            }
            insert testProducts;
            
            Id pricebookId = Test.getStandardPricebookId();
            
            List<PricebookEntry> testPricebookEntry = new List<PricebookEntry>();
            for(Integer i=0; i<2; i++) {
                testPricebookEntry.add(new PricebookEntry(
                    Pricebook2Id = pricebookId,
                    Product2Id = testProducts.get(i).Id,
                    UnitPrice = 1, 
                    IsActive = true
                ));
            }
            insert testPricebookEntry;
            
            List<Schema.Location> testLocations = new List<Schema.Location>();
            for(Integer i=0; i<2; i++) {
                testLocations.add(new Schema.Location(
                    Name = 'Bangalore'+i,
                    IsInventoryLocation = true,
                    LocationType = 'Warehouse'
                ));
            }
            insert testLocations;
            
            List<ProductItem> testProductItems = new List<ProductItem>();
            for(Integer i = 0; i < 2; i++) {
                testProductItems.add(new ProductItem(
                    QuantityOnHand = Double.valueOf(0.0),
                    LocationId = testLocations.get(i).Id,
                    Product2Id = testProducts.get(i).Id
                ));
            }
            system.debug('testProductItems'+testProductItems);
            //insert testProductItems;
            
            List<SerializedProduct> testSerializedProducts = new List<SerializedProduct>();
            for(Integer i=0; i<2; i++) {
                testSerializedProducts.add(new SerializedProduct(
                    Product2Id = testProducts.get(i).Id,
                    // ProductItemId = testProductItems.get(i).Id,
                    Status = 'Available',
                    SerialNumber = '123'+testProducts.get(i).Name+i
                ));
            }
            insert testSerializedProducts;
            
            List<Order> testOrders = new List<Order>();
            for(Integer i=0; i<2; i++) {
                testOrders.add(new Order(
                    AccountId = testAccts.get(i).Id,
                    EffectiveDate = system.today(),
                    pricebook2Id = pricebookId,
                    Status= 'Draft',
                    Type = 'Mark for Order'
                ));
            }
            insert testOrders;
            
            List<Visit> testVisits = new List<Visit>();
            Date dat = System.today();  //Returns today's date
            Date dt = dat.addDays(-2); 
            for(Integer i=0; i<2; i++) {
                testVisits.add(new Visit(
                    AccountId = testAccts.get(i).Id,
                    PlannedVisitEndTime = system.today(),
                    PlannedVisitStartTime = dat,
                    VisitPriority = 'Medium'
                ));
            }
            insert testVisits;
        }catch(Exception e){
            system.debug('exception'+e);
        }
    }

    
    static testMethod void validateGetVisits() {
        Test.startTest();
        Account acc = [SELECT Id from Account limit 1];
        MarkForOrderController.getVisits('TestAcct',acc.Id,5,0);
        Test.stopTest();
    }
    
    static testMethod void negativeValidateGetVisits() {
        try{
            Test.startTest();
            delete [Select Id from Visit];
            Account acc = [SELECT Id from Account limit 1];
            MarkForOrderController.getVisits(null,null,null,null);
            Test.stopTest();
        }catch(Exception e){
            System.assertEquals('Script-thrown exception',e.getMessage());
        }
    }
    
    static testMethod void validategetOrdersWithoutDate() {
        Test.startTest();
        Order order = [SELECT Id from order limit 1];
        MarkForOrderController.getOrders('TestAcct',5,0,null,null);
        list<Order> lstOrder = MarkForOrderController.getOrderById(order.Id);
        Test.stopTest();
        System.assertEquals(lstOrder[0].Id,order.Id);
    }
    
    static testMethod void validategetOrdersWithDate() {
        Test.startTest();
        Date dat = System.today();  //Returns today's date
        Date dt = dat.addDays(-2);  // Returns day after yesterday's date
        MarkForOrderController.getOrders('TestAcct',5,0, dt, system.today());
        Test.stopTest();
    }
    
    static testMethod void negativeGetOrders() {
        try{
            Test.startTest();
            delete [Select Id from Order];
            MarkForOrderController.getOrders(null,null,null,null,null);
            Test.stopTest();
        }catch(Exception e){
            System.assertEquals('Script-thrown exception',e.getMessage());
        }
    }
    
     static testMethod void ValidateLocations() {
        try{
            Test.startTest();
            Account acc = [SELECT Id from Account limit 1];
            MarkForOrderController.getRelatedFulfillmentLocations(acc.id);
            Test.stopTest();
        }catch(Exception e){
            System.assertEquals('Script-thrown exception',e.getMessage());
        }
    }
}