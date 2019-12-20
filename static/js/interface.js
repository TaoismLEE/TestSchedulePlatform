 $(document).ready(function(){
    $("#sendRequest").click(function() {
        const request = new XMLHttpRequest();
        const method = $("#methods").val();
        const path = $("#basic-url").val();
        const url = $("#basic-addon3").text();
        const parameters = $("#sendParameters").val();
        const project_id = $("#tmpProjectID").text();
        const RegExp = $("#inputRxp").val();
        const Alias = $("#alias").val();
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
                for(i=0; i<innResult["data"].length; i++) {
                    let tmp = "";
                    if (innResult["data"][i]["alias"] == "") {
                        tmp = "<tr option='" + innResult["data"][i]["id"] + "'><td class=\"pro_method\">" + innResult["data"][i]["method"] + "</td> <td class=\"pro_url\">" + innResult["data"][i]["url"] + "</td> </tr>";
                    }
                    else
                    {
                        tmp = "<tr option='" + innResult["data"][i]["id"] + "'><td class=\"pro_method\">" + innResult["data"][i]["method"] + "</td> <td class=\"pro_url\">" + innResult["data"][i]["url"] + "[" + innResult["data"][i]["alias"] + "]" + "</td> </tr>";
                    }
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
        para.append("Alias", Alias);
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
                let tmp = "";
                if (result["data"][i]["alias"] == "") {
                    tmp = "<tr option='" + result["data"][i]["id"] + "'><td class=\"pro_method\">" + result["data"][i]["method"] + "</td> <td class=\"pro_url\">" + result["data"][i]["url"] + "</td> </tr>";
                }
                else
                {
                    tmp = "<tr option='" + result["data"][i]["id"] + "'><td class=\"pro_method\">" + result["data"][i]["method"] + "</td> <td class=\"pro_url\">" + result["data"][i]["url"] + "[" + result["data"][i]["alias"] + "]" + "</td> </tr>";
                }
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
            $("#sendParameters").val(result.data.parameters);
            $("#inputRxp").val(result.data.regexp);
            $("#alias").val(result.data.alias);

            $("#returnedData").text("");
            $("#checkResult").text("");
            };

        const para = new FormData();
        para.append("interface_id", interface_id);

        request.send(para);
        return false;
    });

     document.oncontextmenu = function(e) {
         return false;
     }

     $("tbody").on("contextmenu", "tr", function(e) {
        // 获取点击接口ID
        var trs = document.querySelectorAll("tr");
        for(i=0; i<trs.length; i++){
            if (trs[i] == this) {
                localStorage.setItem("interface_id", this.getAttribute("option"));
            }
        }

        // 获取窗口尺寸
        var winWidth = $(document).width();
        var winHeight = $(document).height();
        // 鼠标点击位置坐标
        var mouseX = e.pageX;
        var mouseY = e.pageY;
        // ul标签的宽高
        var menuWidth = $(".contextmenu").width();
        var menuHeight = $(".contextmenu").height();
        // 最小边缘margin(具体窗口边缘最小的距离)
        var minEdgeMargin = 10;
        // 以下判断用于检测ul标签出现的地方是否超出窗口范围
        // 第一种情况：右下角超出窗口
        if(mouseX + menuWidth + minEdgeMargin >= winWidth &&
            mouseY + menuHeight + minEdgeMargin >= winHeight) {
            menuLeft = mouseX - menuWidth - minEdgeMargin + "px";
            menuTop = mouseY - menuHeight - minEdgeMargin + "px";
        }
        // 第二种情况：右边超出窗口
        else if(mouseX + menuWidth + minEdgeMargin >= winWidth) {
            menuLeft = mouseX - menuWidth - minEdgeMargin + "px";
            menuTop = mouseY + minEdgeMargin + "px";
        }
        // 第三种情况：下边超出窗口
        else if(mouseY + menuHeight + minEdgeMargin >= winHeight) {
            menuLeft = mouseX + minEdgeMargin + "px";
            menuTop = mouseY - menuHeight - minEdgeMargin + "px";
        }
        // 其他情况：未超出窗口
        else {
            menuLeft = mouseX + minEdgeMargin + "px";
            menuTop = mouseY + minEdgeMargin + "px";
        };

        // ul菜单出现
        $(".contextmenu").css({
            "left": menuLeft,
            "top": menuTop
        }).show();
        // 阻止浏览器默认的右键菜单事件
        return false;
     });

    // // 鼠标右键事件
    // $("div#hisContent tr").contextmenu(function(e) {
    //     // 获取点击接口ID
    //     var trs = document.querySelectorAll("tr");
    //     for(i=0; i<trs.length; i++){
    //         if (trs[i] == this) {
    //             localStorage.setItem("interface_id", this.getAttribute("option"));
    //         }
    //     }
    //
    //     // 获取窗口尺寸
    //     var winWidth = $(document).width();
    //     var winHeight = $(document).height();
    //     // 鼠标点击位置坐标
    //     var mouseX = e.pageX;
    //     var mouseY = e.pageY;
    //     // ul标签的宽高
    //     var menuWidth = $(".contextmenu").width();
    //     var menuHeight = $(".contextmenu").height();
    //     // 最小边缘margin(具体窗口边缘最小的距离)
    //     var minEdgeMargin = 10;
    //     // 以下判断用于检测ul标签出现的地方是否超出窗口范围
    //     // 第一种情况：右下角超出窗口
    //     if(mouseX + menuWidth + minEdgeMargin >= winWidth &&
    //         mouseY + menuHeight + minEdgeMargin >= winHeight) {
    //         menuLeft = mouseX - menuWidth - minEdgeMargin + "px";
    //         menuTop = mouseY - menuHeight - minEdgeMargin + "px";
    //     }
    //     // 第二种情况：右边超出窗口
    //     else if(mouseX + menuWidth + minEdgeMargin >= winWidth) {
    //         menuLeft = mouseX - menuWidth - minEdgeMargin + "px";
    //         menuTop = mouseY + minEdgeMargin + "px";
    //     }
    //     // 第三种情况：下边超出窗口
    //     else if(mouseY + menuHeight + minEdgeMargin >= winHeight) {
    //         menuLeft = mouseX + minEdgeMargin + "px";
    //         menuTop = mouseY - menuHeight - minEdgeMargin + "px";
    //     }
    //     // 其他情况：未超出窗口
    //     else {
    //         menuLeft = mouseX + minEdgeMargin + "px";
    //         menuTop = mouseY + minEdgeMargin + "px";
    //     };
    //
    //     // ul菜单出现
    //     $(".contextmenu").css({
    //         "left": menuLeft,
    //         "top": menuTop
    //     }).show();
    //     // 阻止浏览器默认的右键菜单事件
    //     return false;
    // });

    // 点击之后，右键菜单隐藏
    $(document).click(function() {
        $(".contextmenu").hide();
    });

     $("#del-interface").click(function () {
            bootbox.confirm({
                message: "Are you sure to delete?",
                buttons: {
                    confirm: {
                        label: 'Yes',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'No',
                        className: 'btn-danger'
                    }
                    },
                callback: function (result) {
                    const interface_id = localStorage.getItem("interface_id");
                    if (result){
                        const request = new XMLHttpRequest();
                        request.open("POST", "/interface/delete");
                        request.onload = function(){
                            const result = JSON.parse(request.responseText);
                            if (result.status == 200) {
                                success_msg(result.Message);
                                setTimeout(function(){
                                    window.location.reload();
                                    }, 2100);
                                }
                        };
                        const paras = new FormData();
                        paras.append("interface_id", interface_id);
                        request.send(paras);
                    }
                }
            });
     });
});

