({
    handleInvokeFlow : function(component, event, helper) {
        component.set("v.isFlow",true);
        component.set("v.flowLaunched",false);
        const flowDetails = event.getParam('flowDetails');
        let flow = component.find("flowId");
        let inputVariables;
        if(flowDetails && flowDetails.caseId){
            inputVariables = [
                {
                    name : 'caseId',
                    type : 'String',
                    value : flowDetails.caseId
                }
            ];
            flow.startFlow(flowDetails.flowName, inputVariables);
        }else if(flowDetails && flowDetails.flowName){
            flow.startFlow(flowDetails.flowName);
        }
        
    },
    
    statusChange : function (cmp, event) {
        
        if (event.getParam('status') === "FINISHED") {
            cmp.set("v.flowLaunched",true);
            cmp.set("v.isFlow",false);
            $A.get('e.force:refreshView').fire();
        }
    },
    /*handleForceRefreshViewForLWC : function(component, event, helper) {
        component.find("returnsListViewCmp").forceRefreshInitiated();
    }*/
})