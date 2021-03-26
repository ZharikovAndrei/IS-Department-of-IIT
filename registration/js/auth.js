	var clickApp = angular.module("clickApp", ['ngDialog']);

	clickApp.controller("clickController", function ($scope, ngDialog) {
		$scope.val = 0;
    $scope.user = {
      name: "",
      email: "", 
      password: ""
    };
		$scope.doClick = function() {
			$scope.val = $scope.val + 1;
		}
		$scope.clickToOpen = function () {
        //ngDialog.open({ template: '/home/dimochka/kafedra/reg_form.html' });
         ngDialog.open({ template: 'reg_form',
         scope: $scope });
    };
	});
	clickApp.controller("bindController", function ($scope) {
    $scope.ngDialogData.user = {
      name: "",
      email: "", 
      password: ""
    };
    });