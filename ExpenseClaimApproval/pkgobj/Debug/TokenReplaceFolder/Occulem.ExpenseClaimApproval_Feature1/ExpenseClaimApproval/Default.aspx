<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="lib/jquery/jquery.min.js"></script>
    <SharePoint:ScriptLink Name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <meta name="WebPartPageExpansion" content="full" />
    <SharePoint:ScriptLink Name="SP.UserProfiles.js" runat="server"
        OnDemand="true" Localizable="false" LoadAfterUI="true" />

    <!-- Add your CSS styles to the following file -->
    <link rel="stylesheet" href="lib/angular-material.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=RobotoDraft:300,400,500,700,400italic">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="lib/angular-loading-bar/loading-bar.min.css" />
    <link rel="stylesheet" href="lib/sp-peoplepicker/sp-peoplepicker.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="lib/angular-datatables/angular-datatables.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="lib/lf-ng-md-file-input/lf-ng-md-file-input.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="lib/angular-trix/trix.css" rel="stylesheet" />
    <link rel="stylesheet" href="lib/customCSS.css" rel="stylesheet" />


    <!-- Add your JavaScript to the following file -->

    <!-- angular files -->
    <script type="text/javascript" src="lib/datatables/jquery.dataTables.js"></script>
    <script type="text/javascript" src="lib/angular/angular.min.js"></script>
    <script type="text/javascript" src="lib/angular-route/angular-route.min.js"></script>
    <script type="text/javascript" src="lib/angular-ui-router/angular-ui-router.js"></script>
    <script type="text/javascript" src="lib/angular-animate/angular-animate.js"></script>
    <script type="text/javascript" src="lib/angular-aria/angular-aria.js"></script>
    <script type="text/javascript" src="lib/angular-messages/angular-messages.js"></script>
    <script type="text/javascript" src="lib/angular-material.min.js"></script>
    <script type="text/javascript" src="lib/angular-loading-bar/loading-bar.min.js"></script>
    <script type="text/javascript" src="lib/sp-peoplepicker/sp-peoplepicker.min.js"></script>
    <script type="text/javascript" src="lib/angular-datatables/angular-datatables.min.js"></script>
    <script type="text/javascript" src="lib/lf-ng-md-file-input/lf-ng-md-file-input.min.js"></script>
    <script type="text/javascript" src="lib/angular-trix/trix.js"></script>
    <script type="text/javascript" src="lib/angular-trix/angular-trix.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jszip/2.4.0/jszip.js"></script>
    <script type="text/javascript" src="lib/jspdf/jspdf.min.js"></script>

    <!-- controllers -->
    <script type="text/javascript" src="app.js"></script>
    <script type="text/javascript" src="controllers/dashboardController.js"></script>

    <!--Service-->

    <script type="text/javascript" src="services/dataaccesslayer/SharePointService.js"></script>
    <script type="text/javascript" src="services/sharepointservices/helperService.js"></script>
    <script type="text/javascript" src="services/sharepointservices/dashboardSharePointService.js"></script>
    <script type="text/javascript" src="services/sharepointservices/applicationLoadService.js"></script>

</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Expense Claim Application
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">


    <div ng-app="ExpenseClaimApproval" ng-controller="dashboardController">
        <md-toolbar layout="row">
          <md-button ng-click="toggleSidenav('left')" hide-gt-sm class="md-icon-button menuBtn">
            <md-icon aria-label="Menu" md-svg-icon="https://s3-us-west-2.amazonaws.com/s.cdpn.io/68133/menu.svg"></md-icon>
          </md-button>
            <br />
            <br />
          <h1 layout-align-gt-sm="center" style="color:white;font-weight:bold;font-size:large" class="md-toolbar-tools">Expense Claim Approval Application</h1>
        </md-toolbar>
        <div layout="row" flex class="content-wrapper">
            <md-sidenav style="overflow: hidden; height: 100vh;" layout="column" class="md-sidenav-left md-whiteframe-z2" md-component-id="left" md-is-locked-open="$mdMedia('gt-sm')">
                  <md-list class="muppet-list">
                    <md-item>
                      <md-item-content>
                        <md-button ui-sref="dashboard" >
                          Dashboard
                        </md-button>
                      </md-item-content>
                    </md-item>  
                  </md-list>
             </md-sidenav>
            <div layout="column" flex class="content-wrapper" id="primary-col">
                <md-content layout="column" flex class="md-padding">
                     <div  ui-view >

                     </div>
                 </md-content>
            </div>
        </div>
    </div>


</asp:Content>
