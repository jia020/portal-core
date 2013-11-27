
Ext.define('portal.widgets.window.CSWFilterWindow', {
    extend : 'Ext.window.Window',


    constructor : function(cfg) {
        this.addEvents('filterselectcomplete');

        var cswFilterFormPanel = new portal.widgets.panel.CSWFilterFormPanel({
            name : 'test'
        });



        Ext.apply(cfg, {
            title : 'Enter Parameters',
            layout : 'fit',
            modal : true,
            width : 500,
            height : 500,
            items : [cswFilterFormPanel],
            buttons:[{
                xtype: 'button',
                text: 'Search',
                scope : this,
                iconCls : 'add',
                handler: function(button) {
                    var parent = button.findParentByType('window');
                    var panel = parent.getComponent(0);

                    if (panel.getForm().isValid()) {
                        var additionalParams = panel.getForm().getValues(false, false, false, false);
                        var filteredResultPanels=[];
                        for(additionalParamKey in additionalParams){
                            if(additionalParamKey == 'cswServiceId'){
                                if(!(additionalParams[additionalParamKey] instanceof Array)){
                                    additionalParams[additionalParamKey]=[additionalParams[additionalParamKey]]
                                }
                                for(var j=0; j < additionalParams[additionalParamKey].length;j++){
                                    //VT:
                                    filteredResultPanels.push(this._getTabPanels(additionalParams,additionalParams[additionalParamKey][j]));
                                }
                            }
                        }

                        parent.fireEvent('filterselectcomplete',filteredResultPanels);

                        var cswSelectionWindow = new CSWSelectionWindow({
                            title : 'CSW Record Selection',
                            resultpanels : filteredResultPanels
                        });
                     cswSelectionWindow.show();
                     parent.close();

                    }
                }
            }]
        });



        this.callParent(arguments);
    },



    /**
     * Utility for calling a template function getTemplatedScript.do
     *
     * The keys from getValues and baseTemplateVariables will be used to populate
     * the keys/values list for the template
     *
     * callback(Number status, String script) - called by the template when a script snippet has finished templating.
     * additionalParams - a regular object containing key/value pairs to inject into the specified template
     * templateName - the name of the template to use
     */
    _getTabPanels : function(params,cswServiceId) {
        //Convert our keys/values into a form the controller can read
        var keys = [];
        var values = [];

        var additionalParams = params;

        //Utility function
        var denormaliseKvp = function(keyList, valueList, kvpObj) {
            if (kvpObj) {
                for (key in kvpObj) {
                    if(kvpObj[key] && kvpObj[key].length>0 && key != 'cswServiceId'){
                        keyList.push(key);
                        valueList.push(kvpObj[key]);
                    }
                }
            }
        };


        denormaliseKvp(keys, values, additionalParams);
        keys.push('cswServiceId');
        values.push(cswServiceId);

      //Create our CSWRecord store (holds all CSWRecords not mapped by known layers)
        var filterCSWStore = Ext.create('Ext.data.Store', {
            model : 'portal.csw.CSWRecord',
            pageSize: 35,
            autoLoad: false,
            proxy : {
                type : 'ajax',
                url : 'getFilteredCSWRecords.do',
                reader : {
                    type : 'json',
                    root : 'data',
                    successProperty: 'success',
                    totalProperty: 'totalResults'
                },
                extraParams: {
                    key : keys,
                    value : values
                }

            }

        });

        var registriesArray = Ext.getCmp('registryTabCheckboxGroup').getChecked();
        var title = "Error retrieving title";
        for(var i = 0; i < registriesArray.length; i ++){
            if(registriesArray[i].inputValue === cswServiceId){
                title = registriesArray[i].boxLabel;
                break;
            }
        }


        var result={
                title : title,
                xtype: 'cswrecordpagingpanel',
                layout : 'fit',
                store : filterCSWStore
            };

        return result;

    }


});
