/**
* Created by Chance on 3/24/2017.
*/
function capitalizeFirstLetter(str) {
return str.charAt(0).toUpperCase() + str.substring(1);
}

function yearNumToText(year) {
if (year === parseInt(year, 10)) {
    switch (year) {
        case -3:
        case -2:
        case -1:
        case 0:
            return 'High School';
        case 1:
            return 'Freshman';
        case 2:
            return 'Sophmore';
        case 3:
            return 'Junior';
        case 4:
            return 'Senior';
    }
    if (year >= 5) {
        return 'Super Senior';
    }
}
return 'invalid year';
}

function formatPhone(str) {
let formatted = "";
if (str.length == 10) {
    formatted = "(" + str.substring(0, 3) + ") " + str.substring(3, 6) + "-" + str.substring(6, 10);
} else if (str.length == 12) {
    formatted = "(" + str.substring(0, 3) + ") " + str.substring(4, 7) + "-" + str.substring(8, 11);
} else if (str.length == 7) {
    formatted = str.substring(0, 3) + "-" + str.substring(3, 7);
} else if (str.length == 8) {
    formatted = str.substring(0, 3) + "-" + str.substring(4, 8);
} else {
    formatted = "invalid";
}
return formatted;
}

angular.module('app', [])
.filter('capFirstLetter', function() {
    return capitalizeFirstLetter;
})
.filter('filterYear', function() {
    return yearNumToText;
})
.filter('filterPhone', function() {
    return formatPhone;
})
.directive('ngStudentName', function() {
    //define the directive object
    return {
        restrict: 'C',
        template: "<b>{{student.lname}}</b>, <b>{{student.fname}}</b>"
    }

})
.factory('studentService', function($http) {
    //HTTP requests go here
    let studentService = {
        getStudents: function() {
            return $http.get('/api/v1/students/students.json');
        },
        getStudent: function(id) {
            return $http.get(`/api/v1/students/${id}.json`);
        },
        delStudent: function(id) {
            return $http.delete(`/api/v1/students/${id}.json`);
        },
        addStudent: function(student) {
            let studentsString = JSON.stringify(student);
            return $http({
                method: "POST",
                url: "/api/v1/students",
                data: studentsString
            });
        },
        updateStudent: function(student) {
            let studentsString = JSON.stringify(student);
            return $http({
                method: "PUT",
                url: `/api/v1/students/${student.id}.json`,
                data: studentsString
            });
        }
    };
    return studentService;
})
.controller('StudentsListController', ['$scope', 'studentService', function($scope, studentService) {
    $scope.sortDir = false;
    $scope.sortVal = "city";
    $scope.MAX = 15;
    $scope.students = [];
    $scope.comp;
    $scope.person = {
        fname: "",
        lname: "",
        startDate: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        year: 0,
        id: ""
    };

    $scope.setSort = function(column) {
        if ($scope.sortVal === column)
            $scope.sortDir = !$scope.sortDir;
        else {
            $scope.sortVal = column;
            $scope.sortDir = false;
        }

        switch($scope.sortVal) {
            case 'fname':
            case 'lname':
            case 'phone':
            case 'street':
            case 'city':
            case 'state':
                $scope.comp = "compareStrings";
                break;
            case 'zip':
                $scope.comp = "compareNumbers";
                break;
            case 'year':
            case 'startDate':
                $scope.comp = "compareDate";
                break;
        }
    };

    $scope.sorted = function(column, direction) {

        return ($scope.sortVal === column) && ($scope.sortDir == direction);
    }

    studentService.getStudents().then(function(res) {
        let ids = res.data;
        for(let i = 0; i < ids.length; i++) {
            studentService.getStudent(ids[i]).then(function(res) {
                $scope.students.push(res.data);
            });
        }
    });

    $scope.studentAdding = false;

    $scope.addStudent = function() {
        console.log($scope.person);
        if (!$scope.person) return;
        if ($scope.students.includes($scope.person)) return;

        $scope.studentAdding = false;

        studentService.addStudent($scope.person).then(function(res) {
            $scope.person.id = res.data;
            $scope.students.push($scope.person);
            $scope.person = {
                fname: "",
                lname: "",
                startDate: "",
                street: "",
                city: "",
                state: "",
                zip: "",
                phone: "",
                year: 0,
                id: ""
            };
        });
        if ($scope.students.length === $scope.MAX) $scope.isMaxedOut = true;

    }

    $scope.saveStudent = function(person) {
        person.editing = false;
        studentService.updateStudent(person);
    }

    $scope.removeStudent = function(person) {
        console.log(person)
        studentService.delStudent(person.id).then(function (res) {
            $scope.students.splice($scope.students.indexOf(person), 1);
        });
    }

    $scope.compareNumbers = function(a, b) {
        return a - b;
    }

    $scope.compareStrings = function (a, b) {
        let strA = a.toLowerCase();
        let strB = b.toLowerCase();

        if (strA < strB) return -1;

        if (strA > strB) return 1;

        return 0;
    }

    $scope.compareDate = function (a, b) {
        let dateA = a.split('/');
        let dateB = b.split('/');


        if (dateA[2] != dateB[2]) {
            // compare year
            return parseInt(dateA[2]) - parseInt(dateB[2]);
        }
        else if (dateA[0] != dateB[0]) {
            // compare month
            return parseInt(dateA[0]) - parseInt(dateB[0]);
        }
        else if (dateA[1] != dateB[1]) {
            // compare day
            return parseInt(dateA[1]) - parseInt(dateB[1]);
        }

        return 0;
    }
}]);