({
    /*
    	Sets up the RequireJS library (async load)
    */
    doInit : function(component, event, helper){
        
        if (typeof require !== "undefined") {
            var evt = $A.get("e.c:requireJSLoaded");
		    evt.fire();
        } else {
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            
            script.src = component.get('v.src'); 
            script.type = 'text/javascript';
            script.key = component.get('v.src'); 
            script.helper = this;
            script.id = "script_" + component.getGlobalId();
            var hlp = helper;
            script.onload = function scriptLoaded(){
                var evt = $A.get("e.c:requireJSLoaded");
		        evt.fire();
            };
            head.appendChild(script);
        }
        helper.setup(component, event, helper);
    },

    
    /*
    	When RequireJS is loaded, loads the typeahead component
    */
    initTypeahead : function(component, event, helper){
     	try{
			//first load the current value of the lookup field and then
			//creates the typeahead component
            helper.loadFirstValue(component);
        }catch(ex){
            console.log(ex);
        }
    },
    /*
     * When the input field is manually changed, the corresponding value (id) is set to null
     */
    checkNullValue : function(component, event, helper){
        try{            
            $A.run(function(){
	            component.set('v.value', null);
            });
        }catch(ex){
            console.log(ex);
        }
	},
})