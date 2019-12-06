 $(document).ready(function(){
    $("#sendRequest").click(function() {
        const request = new XMLHttpRequest();
        const method = $("#methods").val();
        const path = $("#basic-url").val();
        const url = $("#basic-addon3").text();
        const parameters = $("#sendParameters").val();
        const project_id = $("#tmpProjectID").text();
        const RegExp = $("#inputRxp").val();
        if (localStorage.hasOwnProperty(project_id)){
            console.log("Project cookie id exists!");
        }
        else{
            localStorage.setItem(project_id, "{}");
        }
        const project_cookie = localStorage.getItem(project_id);

        //Call API
        request.open("POST", "/api/query");

        //Deal with feedback
        request.onload = function() {
            const result = JSON.parse(request.responseText);
            if (result.status == 200){
                 $("#returnedData").empty();
                 $("#returnedData").text(result.data);
                 $("#checkResult").text(result.Msg);
                 if(result.cookie){
                     let project_cookie_id = $("#tmpProjectID").text();
                     localStorage.setItem(project_cookie_id, result.cookie);
                 }
                 if (result.Msg == "Pass"){
                     $("#checkResult").attr("class", "greenFont");
                 }
                 else if (result.Msg == "Fail"){
                     $("#checkResult").attr("class", "redFont");
                 }
                 else {
                     $("#checkResult").attr("class", "orangeFont");
                 }
            }
            else
                error_msg("Pending...");

            //call search api to update history banel
            let innRequest = new XMLHttpRequest();
            let query_str = $("#filterData").val();
            let project_id = $("#tmpProjectID").text();

            //API call
            innRequest.open("POST", "/interface/query");

            //feedback
            innRequest.onload = function() {
            let innResult = JSON.parse(innRequest.responseText);
            let content_str = "";
            if (innResult["data"].length > 0) {
                //remove previous content
                $("tbody").empty();

                //display returned content
                for(i=0; i<innResult["data"].length; i++){
                    let tmp = "<tr option='" + innResult["data"][i]["id"] + "'><td class=\"pro_method\">" + innResult["data"][i]["method"] + "</td> <td class=\"pro_url\">" + innResult["data"][i]["url"] + "</td> </tr>";
                    content_str = content_str + tmp;
                }
                $("tbody").html(content_str);
                return;
                return;
                }
            else {
                $("tbody").empty();
                return;
                return;
            }
            };

            //send request
            let innPara = new FormData();
            innPara.append("query_str", query_str);
            innPara.append("project_id", project_id);
            innRequest.send(innPara);
        };

        //trigger sending
        const para = new FormData();
        para.append("url", url);
        para.append("path", path);
        para.append("parameters", parameters);
        para.append("methods", method);
        para.append("project_id", project_id);
        para.append("RegExp", RegExp);
        para.append("project_cookie", project_cookie);
        request.send(para);
        return false;
    });

    $("#Validate").click(function(){
        raw_str = $("#returnedData").val();
        Reg_str = $("#inputRxp").val();

        if (Reg_str == "") {
            warning_msg("RegExp is needed generally!");
            return;
        }

        if (raw_str.length > 0) {
            if (raw_str.search(Reg_str) != -1) {
                $("#checkResult").text("PASS");
                $("#checkResult").attr("class", "greenFont");
            }
            else {
                $("#checkResult").text("Fail");
                $("#checkResult").attr("class", "redFont");
            }
        }
        else {
            warning_msg("Call API first to get data for matching!");
        }
    });

    $("#button-addon2").click(function(){
        const request = new XMLHttpRequest();
        const query_str = $("#filterData").val();
        const project_id = $("#tmpProjectID").text();

        //API call
        request.open("POST", "/interface/query");

        //feedback
        request.onload = function() {
        const result = JSON.parse(request.responseText);
        let content_str = "";
        if (result["data"].length > 0) {
            //remove previous content
            $("tbody").empty();

            //display returned content
            for(i=0; i<result["data"].length;i++){
                let tmp = "<tr option='" + result["data"][i]["id"] + "'> <td class=\"pro_method\">" + result["data"][i]["method"] + "</td> <td class=\"pro_url\">" + result["data"][i]["url"] + "</td> </tr>";
                content_str = content_str + tmp;
            }
            $("tbody").html(content_str);
            }
        else {
            $("tbody").empty();
        }
        };

        //send request
        const para = new FormData();
        para.append("query_str", query_str);
        para.append("project_id", project_id);
        request.send(para);
        return false;
    });

    //bind click even to fetch inter-call data
    $("tbody").on("click", "tr", function() {
        //active row by clicking
        var trs = document.querySelectorAll("tr");
        for(i=0; i<trs.length; i++){
            if (trs[i] == this)
                this.setAttribute('class', 'tr-active');
            else
                trs[i].removeAttribute('class');
        }

        //fetch interface data
        const request = new XMLHttpRequest();
        const interface_id = this.getAttribute("option");
        request.open("POST", "/interface/detail");
        request.onload = function () {
            const result = JSON.parse(request.responseText);
            $("#methods").val(result.data.method);
            $("#basic-url").val(result.data.path);
            $("#sendParameters").text(result.data.parameters);
            $("#inputRxp").val(result.data.regexp);

            $("#returnedData").text("");
            $("#checkResult").text("");
            };

        const para = new FormData();
        para.append("interface_id", interface_id);

        request.send(para);
        return false;
    });
});

