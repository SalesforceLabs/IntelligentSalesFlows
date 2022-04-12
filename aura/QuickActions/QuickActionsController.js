({
    handleInvokeFlow : function(component, event, helper) {
        try {
            component.set("v.flowLaunched",false);
            const flowInputs = event.getParam('flowDetails');
            const flow = component.find("flowId");
            
            const inputVariables = [
                { name : "ProductId", type : "String", value: component.get("v.ProductId") }, 
                { name : "LocationId", type : "String", value: component.get("v.LocationId") },
                { name : "VisitId", type : "String", value: component.get("v.VisitId")  },
                { name : "ScannedSerialNumbers", type : "String", value: component.get("v.ScannedSerialNumbers")}
            ]
            
            if(flowInputs.flowName && inputVariables){
                flow.startFlow(flowInputs.flowName, inputVariables);
            }else{
                throw ('Invalid Flow')
            }
            
        } catch (e) {
            console.error(e);
        }
    }, 
    
    statusChange : function (cmp, event) {
        if (event.getParam('status') === "FINISHED") {
            cmp.set("v.flowLaunched",true);
            $A.get('e.force:refreshView').fire();
        }
    }
})