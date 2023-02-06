sap.ui.jsview(UIComponents.POLLITI_VIEW_POLL_DETAILS, {
    getControllerName: function() {
        return UIComponents.POLLITI_CONTROLLER_POLL_DETAILS;
    },

    createContent: function(oController) {
        const oPage = new sap.m.Page(UIComponents.POLLITI_PAGE_POLL_DETAILS, { showNavButton: true, title: Globals.POLLITI_PAGE_POLL_DETAILS_NESTED_PAGE_TITLE });
        oPage.attachNavButtonPress(() => {
            oController.navToPrevious();
        });

        this.createDialog(oPage);
        this.createPageLayout(oPage);

        return oPage;
    },

    createDialog: function(oPage) {
        const thisView = this;
        const oController = this.getController();
        const oDialog = new sap.m.Dialog(UIComponents.POLL_DETAILS_DIALOG, {
            titleAlignment: sap.m.TitleAlignment.Center,
            type: sap.m.DialogType.Message
        });
        oDialog.setBusyIndicatorDelay(0);

        const oDialogMessageStrip = new sap.m.MessageStrip(UIComponents.POLL_DETAILS_DIALOG_MESSAGE_STRIP, {
            type: sap.ui.core.MessageType.Warning,
            showIcon: true
        });
        oDialogMessageStrip.addStyleClass('sapUiResponsiveMargin');

        const oDialogYesButton = new sap.m.Button(UIComponents.POLL_DETAILS_DIALOG_YES_BUTTON, {
            text: Globals.DIALOG_YES_BUTTON_TEXT,
            type: sap.m.ButtonType.Success  
        });
        oDialogYesButton.attachPress(() => {
            // when the parent function is called, oModel is not defined yet, thus we will get it when the button is pressed
            const oModel = thisView.getModel().getProperty(Globals.MODEL_PATH);
            if(oModel.isShowingPollDeletionDialog()) {
                oDialog.setBusy(true);
                oController.tryDeletePoll();
                return;
            }
            oDialog.close();
            oController.navToManualPollVotingMode();
        });

        const oDialogNoButton = new sap.m.Button(UIComponents.POLL_DETAILS_DIALOG_NO_BUTTON, {
            text: Globals.DIALOG_NO_BUTTON_TEXT,
            type: sap.m.ButtonType.Negative  
        });
        oDialogNoButton.attachPress(() => {
            oDialog.close();
        });

        const oDialogReturnToPollsListingButton = new sap.m.Button(UIComponents.POLL_DETAILS_DIALOG_NAV_TO_POLLS_LISTING_BUTTON, {
            text: Globals.DIALOG_RETURN_TO_POLLS_LISTING_BUTTON_TEXT,
            type: sap.m.ButtonType.Emphasized  
        });
        oDialogReturnToPollsListingButton.attachPress(() => {
            oDialog.close();
            oController.navTo(Globals.NAV_POLLS_LISTING);
        });

        oDialog.addContent(oDialogMessageStrip);
        oDialog.addButton(oDialogYesButton);
        oDialog.addButton(oDialogNoButton);
        oDialog.addButton(oDialogReturnToPollsListingButton);

        oPage.addContent(oDialog);
    },

    createPageLayout: function(oPage) {
        const oObjectHeader = new sap.m.ObjectHeader(UIComponents.POLL_DETAILS_OBJECT_HEADER, {
            backgroundDesign: sap.m.BackgroundDesign.Translucent,
            numberUnit: Globals.POLL_ID_TITLE
        });
        oObjectHeader.setVisible(false);

        const oIconTabBar = new sap.m.IconTabBar(UIComponents.POLL_DETAILS_ICON_TAB_BAR);
        oIconTabBar.addStyleClass('sapUiNoContentPadding')
                   .setVisible(false);

        const oPollDetailsFilter = new sap.m.IconTabFilter(UIComponents.POLL_DETAILS_POLL_DETAILS_FILTER, { icon: 'sap-icon://bar-chart'});
        oPollDetailsFilter.setKey(Globals.POLL_DETAILS_FILTER_KEY);

        const oPollActionsFilter = new sap.m.IconTabFilter(UIComponents.POLL_DETAILS_POLL_ACTIONS_FILTER, { icon: 'sap-icon://action' });
        oPollActionsFilter.setKey(Globals.POLL_ACTIONS_FILTER_KEY);

        oIconTabBar.addItem(oPollDetailsFilter);
        oIconTabBar.addItem(oPollActionsFilter);

        oPage.addContent(oObjectHeader);
        oPage.addContent(oIconTabBar);
    },

    loadPage: function(iPollId) {
        this.resetPage();
        this.getController().pageLoaded(iPollId);
    },

    resetPage: function() {
        const oDialog = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG);
        const oObjectHeader = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_OBJECT_HEADER);
        const oIconTabBar = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_ICON_TAB_BAR);
        const aFilterIds = [ UIComponents.POLL_DETAILS_POLL_DETAILS_FILTER, UIComponents.POLL_DETAILS_POLL_ACTIONS_FILTER ];

        if(oDialog.isBusy()) {
            oDialog.setBusy(false);
        }

        if(oDialog.isOpen()) {
            oDialog.close();
        }

        oObjectHeader.setVisible(false);
        oIconTabBar.setVisible(false);

        const oCanvasDomElement = $('#' + UIComponents.POLL_DETAILS_CHART_CANVAS);
        oCanvasDomElement.remove(); // otherwise the bar chart cannot be re-recreated

        for(const sFilterId of aFilterIds) {
            const oFilter = sap.ui.getCore().byId(sFilterId);
            const aFilterContent = oFilter.getContent();
            for(const oItem of aFilterContent) {
                oFilter.removeContent(oItem);
                oItem.destroy();
            }
        }

        oIconTabBar.setSelectedKey(Globals.POLL_DETAILS_FILTER_KEY);
    },

    applyModel: function() {
        const oModel = this.getModel().getProperty(Globals.MODEL_PATH);
        this.applyBasicObjectModel();
        if(!oModel.isBaseObjectModel()) {
            this.applyViewSpecificObjectModel();
        }
    },

    applyBasicObjectModel: function() {
        const oModel = this.getModel().getProperty(Globals.MODEL_PATH);
        const sMessage = oModel.getMessage();

        if(sMessage) {
            this.showFatalError(sMessage);
        }
    },

    applyViewSpecificObjectModel: function() {
        const oModel = this.getModel().getProperty(Globals.MODEL_PATH);
        if(oModel.getId()) {
            // we've got the poll initial information
            this.fillPageLayout();
        }
    },

    fillPageLayout: function() {
        const oController = this.getController();
        const oModel = this.getModel().getProperty(Globals.MODEL_PATH);
        const oObjectHeader = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_OBJECT_HEADER);
        const oIconTabBar = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_ICON_TAB_BAR);

        oObjectHeader.setTitle(oModel.getTitle())
                     .setNumber(oModel.getId())
                     .setVisible(true);

        this.fillFilters();

        oIconTabBar.setVisible(true);

        oController.setAppBusy(false);
    },

    fillFilters: function() {
        this.fillPollDetailsFilter();
        this.fillPollActionsFilter();
    },

    fillPollDetailsFilter: function() {
        const oPollDetailsFilter = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_POLL_DETAILS_FILTER);
        this.createBarChart(oPollDetailsFilter);
        this.createPollDetailsButtons(oPollDetailsFilter);
    },

    createPollDetailsButtons: function(oContainer) {
        const thisView = this;
        const oFlexBox = new sap.m.FlexBox({ justifyContent: sap.m.FlexJustifyContent.Center, wrap: sap.m.FlexWrap.Wrap });
        oFlexBox.addStyleClass('sapUiMediumMarginTopBottom');

        const oDeleteButton = new sap.m.Button({ icon: 'sap-icon://delete', text: Globals.DELETE_POLL_BUTTON_TEXT, type: sap.m.ButtonType.Reject });
        oDeleteButton.addStyleClass('sapUiSmallMarginBottom')
                     .addStyleClass('sapUiTinyMarginEnd')
                     .attachPress(() => {
                         thisView.showPollDeletionDialog();
                     });

        const oEnterTabletPollModeButton = new sap.m.Button({ text: Globals.ENTER_MANUAL_VOTING_MODE_BUTTON_TEXT, type: sap.m.ButtonType.Emphasized });
        oEnterTabletPollModeButton.attachPress(() => {
                                      thisView.showTabletPollModeWarningDialog();
                                  });

        oFlexBox.addItem(oDeleteButton);
        oFlexBox.addItem(oEnterTabletPollModeButton);

        oContainer.addContent(oFlexBox);
    },

    createBarChart: function(oContainer) {
        const thisView = this;
        const oCanvasHtml = new sap.ui.core.HTML({ content: UIComponents.POLL_DETAILS_CHART_CANVAS_HTML });
        oCanvasHtml.attachAfterRendering(() => {
            if(!thisView.getModel().getProperty(Globals.MODEL_PATH).isBaseObjectModel()) {
                // sometimes this gets rerendered when the base object model is passed
                thisView.fillBarChartCanvas();
            }
        });
        oContainer.addContent(oCanvasHtml);
    },

    fillBarChartCanvas() {
        const oModel = this.getModel().getProperty(Globals.MODEL_PATH);
        const oCanvasDomElement = $('#' + UIComponents.POLL_DETAILS_CHART_CANVAS);

        const aLabels = oModel.getOptionsSortedByValuesDescending();
        const aBarColors = UIComponents.POLL_DETAILS_CHART_BAR_COLORS.slice(0, aLabels.length);
        const aValues = oModel.getOptionsValuesSortedDescending();
        // undecided votes are handled separately
        aLabels.push(Globals.POLL_CHART_UNDECIDED_BAR_TITLE);
        aBarColors.push(UIComponents.POLL_DETAILS_CHART_UNDECIDED_BAR_COLOR);
        aValues.push(oModel.getUndecidedVotes());

        const iTotalVotes = oModel.getTotalVotes();
        const iThreshold = oModel.getThreshold();

        new Chart(oCanvasDomElement, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
              labels: aLabels,
              datasets: [{
                label: Globals.POLL_CHART_DATASET_LABEL,
                data: aValues,
                borderWidth: 1,
                backgroundColor: aBarColors
              }]
            },
            options: {
                aspectRatio: 0.6,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            display: false
                        },
                        border: {
                            display: true,
                            color: 'rgba(255, 255, 255, 0.5)'
                        }
                    },
                    y: {
                        display: false
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: Globals.POLL_CHART_TOTAL_VOTES_PREFIX + iTotalVotes,
                        color: 'white',
                        font: {
                            weight: 'normal',
                            size: '18em'
                        },
                        padding: {
                            top: 20,
                            bottom: 10
                        }
                    },
                    subtitle: {
                        display: true,
                        text: Globals.POLL_CHART_THRESHOLD_PREFIX + iThreshold + '%',
                        color: '#91c8f6',
                        font: {
                            weight: 'normal',
                            size: '15em'
                        },
                        padding: {
                            bottom: 30
                        }
                    },
                    legend: {
                        display: false
                    },
                    datalabels: {
                        color: 'white',
                        anchor: 'end',
                        align: 'end',
                        offset: -5,
                        labels: {
                            title: {
                                font: {
                                    weight: 'bold'
                                }
                            }
                        },
                        formatter: (iValue, oCtx) => {
                            let iSum = 0;
                            const aData = oCtx.chart.data.datasets[0].data;
                            aData.map(iData => iSum += iData);
                            let iPercentage = (iValue * 100 / iSum).toFixed(1);
                            if(isNaN(iPercentage)) {
                                iPercentage = 0;
                            }
                            const sPercentage = iPercentage + '%';
                            return sPercentage;
                        },
                    }
                }
            }
        });
    },

    fillPollActionsFilter: function() {

    },

    showFatalError: function(sMessage) {
        const oDialog = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG);
        const oDialogMessageStrip = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_MESSAGE_STRIP);
        const oDialogYesButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_YES_BUTTON);
        const oDialogNoButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_NO_BUTTON);
        const oDialogNavToPollsListingButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_NAV_TO_POLLS_LISTING_BUTTON);

        oDialog.setTitle(Globals.ERROR_DIALOG_TITLE);
        oDialogMessageStrip.setType(sap.ui.core.MessageType.Error);
        oDialogMessageStrip.setText(sMessage);

        oDialogYesButton.setVisible(false);
        oDialogNoButton.setVisible(false);
        oDialogNavToPollsListingButton.setVisible(true);

        if(oDialog.isBusy()) {
            oDialog.setBusy(false);
        }

        if(!oDialog.isOpen()) {
            oDialog.open();
        }
    },

    showPollDeletionDialog: function() {
        const oModel = this.getModel().getProperty(Globals.MODEL_PATH);
        const oDialog = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG);
        const oDialogMessageStrip = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_MESSAGE_STRIP);
        const oDialogYesButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_YES_BUTTON);
        const oDialogNoButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_NO_BUTTON);
        const oDialogNavToPollsListingButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_NAV_TO_POLLS_LISTING_BUTTON);

        oDialog.setTitle(Globals.POLL_DELETION_DIALOG_TITLE);
        oDialogMessageStrip.setType(sap.ui.core.MessageType.Warning);
        oDialogMessageStrip.setText(Globals.POLL_DELETION_WARNING);

        oDialogYesButton.setVisible(true);
        oDialogNoButton.setVisible(true);
        oDialogNavToPollsListingButton.setVisible(false);

        oModel.setIsShowingPollDeletionDialog(true);
        oDialog.open();
    },

    showTabletPollModeWarningDialog: function() {
        const oModel = this.getModel().getProperty(Globals.MODEL_PATH);
        const oDialog = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG);
        const oDialogMessageStrip = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_MESSAGE_STRIP);
        const oDialogYesButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_YES_BUTTON);
        const oDialogNoButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_NO_BUTTON);
        const oDialogNavToPollsListingButton = sap.ui.getCore().byId(UIComponents.POLL_DETAILS_DIALOG_NAV_TO_POLLS_LISTING_BUTTON);

        oDialog.setTitle(Globals.POLL_MANUAL_VOTING_DIALOG_TITLE);
        oDialogMessageStrip.setType(sap.ui.core.MessageType.Warning);
        oDialogMessageStrip.setText(Globals.POLL_MANUAL_VOTING_WARNING);

        oDialogYesButton.setVisible(true);
        oDialogNoButton.setVisible(true);
        oDialogNavToPollsListingButton.setVisible(false);

        oModel.setIsShowingPollDeletionDialog(false);
        oDialog.open();
    },

    setObjectModel: function(oObjectModel) {
        const oModel = {
            [Globals.MODEL_PATH_KEY]: oObjectModel
        };
        this.setModel(new sap.ui.model.json.JSONModel(oModel));
    }
});