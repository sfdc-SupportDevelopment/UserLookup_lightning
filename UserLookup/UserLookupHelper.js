({
    /*
    	Verify component has been loaded with the required params
    */
    setup : function(component, event, helper){
        if(!component.get('v.type') ){
            $A.error("inputLookup component requires a valid SObject type as input: ["+component.getGlobalid()+"]");
            return;
        }
    },
    //typeahead already initialized
    typeaheadInitStatus : {},
    //"old value" to trigger reload on "v.value" change
    typeaheadOldValue : {},
    /*
    	Creates the typeahead component using RequireJS, jQuery, Bootstrap and Bootstrap Typeahead
    */
    createTypeaheadComponent: function(component){
        
        require.config({
            paths: {
                "jquery": "/resource/Lgt_InputLookup/js/jquery-2.1.1.min.js?",
                "bootstrap": "/resource/Lgt_InputLookup/js/bootstrap.min.js?",
                /* https://github.com/twitter/typeahead.js */
                "boot-typeahead" : "/resource/Lgt_InputLookup/js/typeahead.js?",
            }
        });
        
        var self = this;
        var globalId = component.getGlobalId();
        //loading libraries sequentially
        require(["jquery"], function($) {
            require(["bootstrap", "boot-typeahead"], function(bootstrap, typeahead) {
                var inputElement = $('[id="'+globalId+'_typeahead"]');

                //inits the typeahead
                inputElement.typeahead({
                    hint: false,
                    highlight: true,
                    minLength: 2
                },
                {
                    name: 'objects',
                    displayKey: 'value',
                    source: self.substringMatcher(component)
                })
                //selects the element
                .bind('typeahead:selected', 
                      function(evnt, suggestion){
                          $A.run(function(){
                              component.set('v.value', suggestion.id);
                              component.set('v.nameValue', suggestion.value);
                          });
                      });
            });//require end
        });//require end
    },
    /*
     * Method used by the typeahead to retrieve search results
     */
    substringMatcher : function(component) {
        //usefull to escape chars for regexp calculation
        function escapeRegExp(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
        
        return function findMatches(q, cb) {
            q = escapeRegExp(q);
            var action = component.get("c.searchSObject");
            var self = this;
			
			action.setParams({
                'type' : component.get('v.type'),
                'searchString' : q
            });
            
            action.setCallback(this, function(a) {
                if(a.error && a.error.length){
                    return $A.error('Unexpected error: '+a.error[0].message);
                }
                var result = a.getReturnValue();
                var matches, substrRegex;
                
                // an array that will be populated with substring matches
                var matches = [];
                
                
                
                // regex used to determine if a string contains the substring `q`
                var substrRegex = new RegExp(q, 'i');
                var strs = JSON.parse(result);
                // iterate through the pool of strings and for any string that
                // contains the substring `q`, add it to the `matches` array
                
                if(strs != '')
                {
                    console.log('renu 1:'+strs);
                    $.each(strs, function(i, str) {
                        if (substrRegex.test(str.value)) {
                            // the typeahead jQuery plugin expects suggestions to a
                            // JavaScript object, refer to typeahead docs for more info
                            matches.push({ value: str.value , id: str.id});
                        }               
                    });  
                }
                else
                {
                    console.log('renu 2:'+strs);
                    matches.push({ value: 'User Not Found' , id: null});
                }
                
                if(!strs || !strs.length){                    
                    $A.run(function(){
                        component.set('v.value', null );
                    });
                }                
                cb(matches);
            });
            $A.run(function(){
                $A.enqueueAction(action);
            });
        };
    },
    /*
     * Method used on initialization to get the "name" value of the lookup
     */
    loadFirstValue : function(component) {
        //this is necessary to avoid multiple initializations (same event fired again and again)
        if(this.typeaheadInitStatus[component.getGlobalId()]){ 
			return;
        }
        this.typeaheadInitStatus[component.getGlobalId()] = true;
        this.loadValue(component);
           
    },
    
    /*
     * Method used to load the initial value of the typeahead 
     * (used both on initialization and when the "v.value" is changed)
     */
    loadValue : function(component, skipTypeaheadLoading){
        this.typeaheadOldValue[component.getGlobalId()] = component.get('v.value');
        var action = component.get("c.getCurrentValue");
        var self = this;
        action.setParams({
            'type' : component.get('v.type'),
            'value' : component.get('v.value'),
        });
        
        action.setCallback(this, function(a) {
            if(a.error && a.error.length){
                return $A.error('Unexpected error: '+a.error[0].message);
            }
            var result = a.getReturnValue();
			component.set('v.isLoading',false);
            component.set('v.nameValue',result);
            if(!skipTypeaheadLoading) self.createTypeaheadComponent(component);
        });
        $A.enqueueAction(action);
    }
})