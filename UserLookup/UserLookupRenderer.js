({
    /*
     * When the v.value field changes its value, the lookup is loaded again
     */
    rerender : function(component, helper){
        this.superRerender();
		//if value changes, triggers the loading method
        if(helper.typeaheadOldValue[component.getGlobalId()] !== component.get('v.value')){
            helper.loadValue(component,true);
        }
    },   
    afterRender: function(component, helper) {
        var svg = component.find("svg_content");
        var value = svg.getElement().innerText;
        value = value.replace("<![CDATA[", "").replace("]]>", "");
        svg.getElement().outerHTML = value;        
    }
})