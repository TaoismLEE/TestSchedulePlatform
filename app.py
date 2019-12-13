from module.modules import db, User, and_, Project, Interface, InterfaceLog, Task, Batch, BatchHis
from flask import Flask, request, render_template, jsonify, redirect, url_for, json, current_app
from flask_script import Manager
from flask_apscheduler import APScheduler
from flask_mail import Message, Mail
import requests
import re
import time
import pymysql
from dateutil.parser import parse


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:123456@10.2.70.176:3306/tsp"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JSON_AS_ASCII"] = False
app.config['MAIL_SERVER'] = 'smtp.exmail.qq.com'
app.config['MAIL_PORT'] = 25
app.config['MAIL_USERNAME'] = 'yu.li@hualongdata.com'
app.config['MAIL_PASSWORD'] = '2UCdZ79NgobbYTqe'

db.init_app(app)
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

mail = Mail(app)
manager = Manager(app)


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/signup', methods=["POST"])
def sign_up():
    username = request.form.get("username")
    password = request.form.get("password")
    qq = request.form.get("qq")
    msn = request.form.get("msn")
    phone = request.form.get("phone")
    mail = request.form.get("mail")
    #photo = request.form.get("photo")

    user = User.query.filter(User.USERNAME == username).first()
    if user:
        return jsonify({"ErrMsg": "UserName already used, choose another one please!", "status": 400}), 400
    else:
        insUser = User(username=username, password=password, qq=qq, msn=msn, phone=phone, mail=mail)
        db.session.add(insUser)
        db.session.commit()
        return jsonify({"Message": "Sign up successfully!", "status": 200}), 200


@app.route('/projectregist', methods=["POST"])
def project_regist():
    project_name = request.form.get("projectname")
    incharger = request.form.get("incharger")
    description = request.form.get("description")
    #logo = request.form.get("logo")
    phone = request.form.get("phone")
    owned_by = request.form.get("owned_by")
    project_url = request.form.get("project_url")

    project = Project.query.filter(and_(Project.PROJECT_NAME == project_name, Project.VALID == "Y", Project.OWNED_BY == owned_by)).first()
    if project:
        return jsonify({"ErrMsg": "ProjectName registed, choose another one please!", "status": 400}), 400
    else:
        insProject = Project(project_name=project_name, project_url=project_url, owned_by=owned_by, incharger=incharger, phone=phone, description=description)
        db.session.add(insProject)
        db.session.commit()
        return jsonify({"Message": "Regist project successfully!", "status": 200})


@app.route('/signin', methods=["POST"])
def sign_in():
    username = request.form.get("username")
    password = request.form.get("password")

    user = User.query.filter(and_(User.USERNAME == username, User.PASSWORD == password)).first()
    if user:
        return jsonify({"Message": "Sign in successfully!", "url": "/project", "user": user.ID, "status": 200})
    else:
        return jsonify({"ErrMsg": "Username or password is wrong!", "status": 400})


@app.route('/signout', methods=['POST'])
def sign_out():
    return jsonify({"url": "/", "status": 200})


@app.route('/user/edit', methods=['POST'])
def user_edit():
    user_id = request.form.get("user_id")
    user = User.query.filter(User.ID == user_id).first()
    if user:
        tmp = dict()
        tmp["ID"] = user.ID
        tmp["USERNAME"] = user.USERNAME
        tmp["PASSWORD"] = user.PASSWORD
        tmp["QQ"] =user.QQ
        tmp["MSN"] = user.MSN
        tmp["PHONE"] = user.PHONE
        tmp["MAIL"] = user.MAIL
        return jsonify({"data": tmp, "status": 200})
    else:
        return jsonify({"ErrMsg": "User not found!", "status": 400}), 400


@app.route('/user/edit/save', methods=['POST'])
def user_edit_save():
    user_id = request.form.get("user_id")
    password = request.form.get("password")
    qq = request.form.get("qq")
    msn = request.form.get("msn")
    phone = request.form.get("phone")
    mail = request.form.get("mail")

    user = User.query.filter(User.ID == user_id).first()
    user.PASSWORD = password
    user.QQ = qq
    user.MSN = msn
    user.PHONE = phone
    user.MAIL = mail
    db.session.commit()
    return jsonify({"Message": "Update user successfully!", "url": "/", "status": 200})


@app.route('/project/<int:user_id>', methods=["POST", "GET"])
def project(user_id):
    user = User.query.get(user_id)
    projects = Project.query.filter(and_(Project.OWNED_BY == user_id, Project.VALID == "Y")).all()
    return render_template("project.html", user=user, projects=projects)


@app.route('/project/edit', methods=['POST'])
def project_edit():
    project_id = request.form.get("project_id")
    project = Project.query.filter(Project.ID == project_id).first()
    if project:
        tmp = dict()
        tmp["ID"] = project.ID
        tmp["PROJECT_NAME"] = project.PROJECT_NAME
        tmp["PROJECT_URL"] = project.PROJECT_URL
        tmp["INCHARGER"] =project.INCHARGER
        tmp["PHONE"] = project.PHONE
        tmp["DESCRIPTION"] = project.DESCRIPTION
        return jsonify({"data": tmp, "status": 200})
    else:
        return jsonify({"ErrMsg": "Project not found!", "status": 400}), 400


@app.route('/project/delete', methods=['POST'])
def project_delete():
    project_id = request.form.get("project_id")
    project = Project.query.filter(Project.ID == project_id).first()
    project.VALID = "N"
    db.session.commit()
    return jsonify({"Message": "Delete project successfully!", "status": 200})


@app.route('/project/edit/save', methods=['POST'])
def project_edit_save():
    project_id = request.form.get("project_id")
    project_name = request.form.get("projectname")
    project_url = request.form.get("project_url")
    incharger = request.form.get("incharger")
    phone = request.form.get("phone")
    description = request.form.get("description")

    project = Project.query.filter(Project.ID == project_id).first()
    project.PROJECT_NAME = project_name
    project.PROJECT_URL = project_url
    project.INCHARGER = incharger
    project.PHONE = phone
    project.DESCRIPTION = description
    db.session.commit()
    return jsonify({"Message": "Update project successfully!", "status": 200})


@app.route('/interface/<int:project_id>', methods=["POST", "GET"])
def interface(project_id):
    project = Project.query.filter_by(ID=project_id).first()
    hisCalls = Interface.query.filter(Interface.BELONG_PROJECT == project_id).order_by(Interface.EXECUTE_TIME.desc()).all()
    return render_template("interface.html", project=project, histories=hisCalls)


@app.route('/interface/query', methods=["POST"])
def interface_query():
    histories = list()
    query_str = request.form.get("query_str")
    project_id = request.form.get("project_id")
    project = Project.query.get(project_id)
    base_url = project.PROJECT_URL
    hisCalls = Interface.query.filter(and_(Interface.BELONG_PROJECT == int(project_id), Interface.URL.like("%" + query_str + "%"))).order_by(Interface.EXECUTE_TIME.desc()).all()
    for history in hisCalls:
            tmp = dict()
            tmp["method"] = history.METHODS
            tmp["url"] = base_url + history.URL
            tmp["id"] = history.ID
            histories.append(tmp)
    return jsonify({"data": histories, "status": 200}), 200


@app.route('/interface/detail', methods=["POST"])
def interface_detail():
    interface_id = request.form.get("interface_id")
    interface = Interface.query.get(interface_id)
    inter_data = dict()
    inter_data["method"] = interface.METHODS
    inter_data["path"] = interface.URL
    inter_data["parameters"] = interface.PARAMETERS
    inter_data["regexp"] = interface.CHECK_REGEXP
    return jsonify({"data": inter_data, "status": 200}), 200


@app.route("/api/query", methods=['GET', 'POST', 'UPDATE', 'DELETE'])
def query_apis():
    response = ""
    url = request.form.get("url")
    path = request.form.get("path")
    parameters = request.form.get("parameters")
    belong_project = request.form.get("project_id")
    pattern = request.form.get("RegExp")
    method = request.form.get("methods")
    request_cookie = request.form.get("project_cookie")
    if parameters:
        data_json = json.loads(parameters)
    full_url = url + path

    if method == "POST":
        if parameters:
            response = requests.post(full_url, data=data_json, cookies=eval(request_cookie), verify=False)
            cookies = requests.utils.dict_from_cookiejar(response.cookies)
        else:
            response = requests.post(full_url, cookies=eval(request_cookie))
            cookies = requests.utils.dict_from_cookiejar(response.cookies)
    elif method == "GET":
        if parameters:
            response = requests.get(full_url, cookies=eval(request_cookie), params=parameters)
            cookies = requests.utils.dict_from_cookiejar(response.cookies)
        else:
            response = requests.get(full_url, cookies=eval(request_cookie))
            cookies = requests.utils.dict_from_cookiejar(response.cookies)
    else:
        print("The method currently NOT supported!")
    exe_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    # if the URL has been tested, move to interface_log table
    record = Interface.query.filter(and_(Interface.BELONG_PROJECT == belong_project, Interface.URL == path)).first()
    if record:
        int_log = InterfaceLog(re_id=record.ID, methods=record.METHODS, project_url=record.URL, parameters=record.PARAMETERS, \
                               belong_project=record.BELONG_PROJECT, response=record.API_RETURN, current_time=record.EXECUTE_TIME, \
                               check_regexp=record.CHECK_REGEXP, check_result=record.CHECK_RESULT)
        db.session.add(int_log)
        db.session.delete(record)

    if pattern:
        if re.search(pattern, str(json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':')))):
            interface = Interface(methods=request.form.get("methods"), project_url=path, parameters=parameters,
                                  belong_project=belong_project, response=str(
                                      json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))),
                                  check_regexp=pattern, current_time=exe_time, check_result="Pass")
            db.session.add(interface)
            db.session.commit()
            if cookies:
                return jsonify({"cookie": str(cookies), "data": str(json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))), "Msg": "Pass", "status": 200}), 200
            else:
                return jsonify({"data": str(json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))), "Msg": "Pass", "status": 200}), 200
        else:
            interface = Interface(methods=request.form.get("methods"), project_url=path, parameters=parameters,
                                  belong_project=belong_project, response=str(
                                      json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))),
                                  check_regexp=pattern, current_time=exe_time, check_result="Fail")
            db.session.add(interface)
            db.session.commit()
            if cookies:
                return jsonify({"cookie": str(cookies), "data": str(json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))), "Msg": "Fail", "status": 200}), 200
            else:
                return jsonify({"data": str(json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))), "Msg": "Fail", "status": 200}), 200
    else:
        interface = Interface(methods=request.form.get("methods"), project_url=path, parameters=parameters,
                              belong_project=belong_project, response=str(
                                  json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))),
                              check_regexp=pattern, current_time=exe_time)
        db.session.add(interface)
        db.session.commit()
        if cookies:
            return jsonify({"cookie": str(cookies), "data": str(json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))), "Msg": "Skip", "status": 200}), 200
        else:
            return jsonify({"data": str(json.dumps(response.json(), sort_keys=True, indent=4, separators=(',', ':'))), "Msg": "Skip", "status": 200}), 200


@app.route('/tasks/<int:project_id>', methods=["POST", "GET"])
def tasks(project_id):
    if request.method == "GET":
        project = Project.query.filter_by(ID=project_id).first()
        tasks = Task.query.filter_by(BELONG_PROJECT=project_id)
        return render_template("task.html", project=project, tasks=tasks)
    elif request.method == "POST":
        list_tasks = list()
        task_name = request.form.get("task_name")
        tasks = Task.query.filter(and_(Task.TASK_NAME.like("%" + task_name + "%"), Task.BELONG_PROJECT == project_id)).all()
        for task in tasks:
            tmp = dict()
            tmp["id"] = task.ID
            tmp["task_name"] = task.TASK_NAME
            tmp["cron_exp"] = task.CRON_EXP
            tmp["status"] = task.STATUS
            tmp["create_time"] = str(task.CREATE_TIME)
            tmp["belong_project"] = task.BELONG_PROJECT
            tmp["start_time"] = str(task.START_TIME)
            tmp["end_time"] = str(task.END_TIME)
            tmp["execute_time"] = task.EXECUTE_TIME
            list_tasks.append(tmp)
        return jsonify({"data": list_tasks, "status": 200}), 200


@app.route('/task/create', methods=["POST"])
def create_task():
    task_name = request.form.get("task_name")
    cron_exp = request.form.get("cron_exp")
    belong_project = request.form.get("belong_project")

    task = Task(task_name, cron_exp, 1, time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()), belong_project)
    db.session.add(task)
    db.session.commit()
    return jsonify({"Message": "Create task successfully!", "status": 200}), 200


@app.route('/task/edit/save', methods=["POST"])
def edit_task():
    task_name = request.form.get("task_name")
    cron_exp = request.form.get("cron_exp")
    task_id = request.form.get("task_id")

    task = Task.query.filter_by(ID=task_id).first()
    task.TASK_NAME = task_name
    task.CRON_EXP = cron_exp
    db.session.commit()
    return jsonify({"Message": "Edit task successfully!", "status": 200}), 200


@app.route('/task/delete', methods=["POST"])
def delete_task():
    task_arr = request.form.get("task_arr")
    task_arr = task_arr.split(",")
    for i in task_arr:
        task = Task.query.get(i)
        db.session.delete(task)
    db.session.commit()
    return jsonify({"Message": "Delete task successfully!", "status": 200}), 200


@app.route('/schedule/task', methods=["POST"])
def schedule_task():
    task_id = request.form.get("task_id")
    # add job to scheduler
    task = Task.query.filter_by(ID=task_id).first()
    cron_exp = task.CRON_EXP
    cron_list = cron_exp.split()
    # schedule week job
    if cron_list[-1] != '*':
        if cron_list[-1] == '0':
            day_of_week = 6
        else:
            day_of_week = int(cron_list[-1]) - 1
        hour = int(cron_list[1])
        minute = int(cron_list[0])
        app.apscheduler.add_job(id=task_id, func=busi_func, trigger='cron', day_of_week=day_of_week, hour=hour, minute=minute, args=(task_id,))
    # schedule year job
    elif cron_list[-1] == '*' and cron_list[-2] != '*':
        month = int(cron_list[-2])
        day = int(cron_list[2])
        hour = int(cron_list[1])
        minute = int(cron_list[0])
        app.apscheduler.add_job(id=task_id, func=busi_func, trigger='cron', month=month, day=day, hour=hour, minute=minute, args=(task_id,))
    # schedule month job
    elif cron_list[-1] == '*' and cron_list[-2] == '*' and cron_list[-3] != '*':
        day = int(cron_list[2])
        hour = int(cron_list[1])
        minute = int(cron_list[0])
        app.apscheduler.add_job(id=task_id, func=busi_func, trigger='cron', day=day, hour=hour, minute=minute, args=(task_id,))
    # schedule day job
    elif cron_list[-1] == '*' and cron_list[-2] == '*' and cron_list[-3] == '*' and cron_list[-4] != '*':
        hour = int(cron_list[1])
        minute = int(cron_list[0])
        app.apscheduler.add_job(id=task_id, func=busi_func, trigger='cron', hour=hour, minute=minute, args=(task_id,))
    # schedule hour job
    elif cron_list[-1] == '*' and cron_list[-2] == '*' and cron_list[-3] == '*' and cron_list[-4] == '*' and cron_list[-5] != '*':
        minute = int(cron_list[0])
        app.apscheduler.add_job(id=task_id, func=busi_func, trigger='cron', minute=minute, args=(task_id,))
    # schedule job per 5 seconds
    else:
        app.apscheduler.add_job(id=task_id, func=busi_func, trigger='cron', second='*/30', args=(task_id,))
    # update status
    task.STATUS = 2
    db.session.commit()
    return jsonify({"Message": "Schedule task successfully!", "status": 200}), 200


def busi_func(task_id):
    send_email_flag = None
    login_url = ''
    login_method = ''
    login_parameter = ''
    request_cookie = '{}'
    dbc = pymysql.connect(host="10.2.70.176", user="root", passwd="123456", db="tsp")
    cur = dbc.cursor()
    start_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    sql_r = "update tasks set STATUS='" + str(3) + "'" + " WHERE ID=" + task_id
    sqls = "update tasks set START_TIME='" + start_time + "'" + " WHERE ID=" + task_id
    clear_end_time = "update tasks set END_TIME=NULL WHERE ID=" + task_id
    clear_execute_time = "update tasks set EXECUTE_TIME=NULL WHERE ID=" + task_id
    cur.execute(sql_r)
    cur.execute(sqls)
    cur.execute(clear_end_time)
    cur.execute(clear_execute_time)
    dbc.commit()
    # get project_id and base_url
    project_id_sql = "select BELONG_PROJECT from tasks where ID=" + task_id
    cur.execute(project_id_sql)
    row = cur.fetchone()
    project_id = row[0]
    project_url_sql = "select PROJECT_URL from projects where ID=" + str(project_id)
    cur.execute(project_url_sql)
    row = cur.fetchone()
    base_url = row[0]
    # check loginAPI and get cookies
    login_api_sql = "select * from batches where BELONG_PROJECT=" + str(project_id) + " and BELONG_TASK=" + str(task_id)
    cur.execute(login_api_sql)
    rows = cur.fetchall()
    for i in rows:
        if i[7] == 'Y':
            login_method = i[1]
            login_api = i[2]
            login_url = base_url + login_api
            login_parameter = i[3]
            request_cookie = call_login_api(login_method, login_url, login_parameter, request_cookie)
    # loop to call all choosed APIs
    all_apis_sql = "select * from batches where BELONG_PROJECT=" + str(project_id) + " and BELONG_TASK=" + str(task_id)
    cur.execute(all_apis_sql)
    choosed_apis = cur.fetchall()
    batch_time = time.strftime("%Y%m%d_%H%M%S", time.localtime())
    for api in choosed_apis:
        method = api[1]
        loginAPI = api[2]
        full_url = base_url + loginAPI
        parameters = api[3]
        check_exp = api[4]
        login_flag = api[8]
        loop_api(method, full_url, parameters, check_exp, login_flag, request_cookie, login_method, login_url, login_parameter, batch_time, cur, project_id, task_id)
    time.sleep(5)
    current_status = "select STATUS from tasks where ID=" + task_id
    dbc.commit()
    cur.execute(current_status)
    row = cur.fetchone()
    status = row[0]
    if status == "3":
        sql_s = "update tasks set STATUS='" + str(2) + "'" + " WHERE ID=" + task_id
        cur.execute(sql_s)
        dbc.commit()
    end_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    sqle = "update tasks set END_TIME='" + end_time + "'" + " WHERE ID=" + task_id
    execute_time = (parse(end_time) - parse(start_time)).seconds
    sqlt = "update tasks set EXECUTE_TIME='" + str(execute_time) + "'" + " WHERE ID=" + task_id
    cur.execute(sqle)
    cur.execute(sqlt)
    dbc.commit()

    # check execution result to send email
    sql_result = "select * from batches_his where BATCH_ID='" + str(batch_time) + "'"
    cur.execute(sql_result)
    result_rows = cur.fetchall()
    dbc.commit()
    for item in result_rows:
        if item[7] == 'Fail':
            send_email_flag = 1
    # trigger to send email if send_email_flag equals 1
    if send_email_flag:
        project_url_sql = "select * from projects where ID=" + str(project_id)
        cur.execute(project_url_sql)
        row = cur.fetchone()
        with app.app_context():
            send_email(row[2] + " - API Test Report", 'email', result_rows, row)


def send_email(subject, template, histories, project):
    msg = Message(subject, sender='yu.li@hualongdata.com', recipients=['yu.li@hualongdata.com'])
    msg.html = render_template(template + '.html', histories=histories, project=project)
    mail.send(msg)


def call_login_api(method, full_url, parameters, request_cookie):
    if parameters:
        data_json = json.loads(parameters)
    if method == "POST":
        if parameters:
            response = requests.post(full_url, data=data_json, cookies=eval(request_cookie), verify=False)
            cookies = requests.utils.dict_from_cookiejar(response.cookies)
            return str(cookies)
        else:
            response = requests.post(full_url, cookies=eval(request_cookie))
            cookies = requests.utils.dict_from_cookiejar(response.cookies)
            return str(cookies)
    elif method == "GET":
        if parameters:
            response = requests.get(full_url, cookies=eval(request_cookie), params=parameters)
            cookies = requests.utils.dict_from_cookiejar(response.cookies)
            return str(cookies)
        else:
            response = requests.get(full_url, cookies=eval(request_cookie))
            cookies = requests.utils.dict_from_cookiejar(response.cookies)
            return str(cookies)
    else:
        print("The method currently NOT supported!")


def loop_api(method, full_url, parameters, check_exp, login_flag, request_cookie, login_method, login_url, login_parameter, batch_time, cur, project_id, task_id):
    inner_cookie = '{}'
    if login_flag == "Y":
        inner_cookie = call_login_api(login_method, login_url, login_parameter, request_cookie)
    if parameters:
        data_json = json.loads(parameters)
    inner_exe_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    if method == "POST":
        if parameters:
            response = requests.post(full_url, data=data_json, cookies=eval(inner_cookie), verify=False)
        else:
            response = requests.post(full_url, cookies=eval(inner_cookie))
    elif method == "GET":
        if parameters:
            response = requests.get(full_url, cookies=eval(inner_cookie), params=parameters)
        else:
            response = requests.get(full_url, cookies=eval(inner_cookie))
    else:
        print("The method currently NOT supported!")
    if check_exp:
        if re.search(check_exp, str(json.dumps(response.json(), ensure_ascii=False, sort_keys=True, indent=4, separators=(',', ':')))):
            tmp_sql = "insert into batches_his (BATCH_ID, METHODS, URL, PARAMETERS, API_RETURN, CHECK_REGEXP, CHECK_RESULT, BELONG_TASK, BELONG_PROJECT, EXECUTE_TIME) values ('" + batch_time + "','" + method + "','" + full_url + "','" + parameters + "','" + str(
                                      json.dumps(response.json(), ensure_ascii=False, sort_keys=True, indent=4, separators=(',', ':'))) + "','" + check_exp + "','" + "Pass" + "'," + str(task_id) + "," + str(project_id) + ",'" + inner_exe_time + "')"
            cur.execute(tmp_sql)
        else:
            tmp_sql = "insert into batches_his (BATCH_ID, METHODS, URL, PARAMETERS, API_RETURN, CHECK_REGEXP, CHECK_RESULT, BELONG_TASK, BELONG_PROJECT, EXECUTE_TIME) values ('" + batch_time + "','" + method + "','" + full_url + "','" + parameters + "','" + str(
                                      json.dumps(response.json(), ensure_ascii=False, sort_keys=True, indent=4, separators=(',', ':'))) + "','" + check_exp + "','" + "Fail" + "'," + str(task_id) + "," + str(project_id) + ",'" + inner_exe_time + "')"
            cur.execute(tmp_sql)
    else:
        tmp_sql = "insert into batches_his (BATCH_ID, METHODS, URL, PARAMETERS, API_RETURN, CHECK_REGEXP, CHECK_RESULT, BELONG_TASK, BELONG_PROJECT, EXECUTE_TIME) values ('" + batch_time + "','" + method + "','" + full_url + "','" + parameters + "','" + str(
                                      json.dumps(response.json(), ensure_ascii=False, sort_keys=True, indent=4, separators=(',', ':'))) + "','" + check_exp + "','" + "Skip" + "'," + str(task_id) + "," + str(project_id) + ",'" + inner_exe_time + "')"
        cur.execute(tmp_sql)


@app.route('/cancel/task', methods=["POST"])
def cancel_task():
    task_id = request.form.get("task_id")
    app.apscheduler.remove_job(task_id)
    task = Task.query.get(task_id)
    task.STATUS = 4
    db.session.commit()
    return jsonify({"Message": "Off-schedule task successfully!", "status": 200}), 200


@app.route('/config_apis/<int:task_id>', methods=["GET"])
def config_apis(task_id):
    task = Task.query.get(task_id)
    project_id = task.BELONG_PROJECT
    project = Project.query.get(project_id)
    apis = Interface.query.filter(Interface.BELONG_PROJECT == project_id).all()
    choosed_apis = Batch.query.filter(and_(Batch.BELONG_PROJECT == project_id, Batch.BELONG_TASK == task_id)).all()
    for item in choosed_apis:
        for inner_item in apis:
            if item.URL == inner_item.URL:
                apis.remove(inner_item)
    return render_template("config_api.html", project=project, apis=apis, choosed_apis=choosed_apis, task_id=task_id)


@app.route('/his_report/<int:task_id>/<int:page_num>', methods=["POST", "GET"])
def his_report(task_id, page_num=None):
    if not page_num:
        page_num = 1
    task = Task.query.filter(Task.ID == task_id).first()
    project_id = task.BELONG_PROJECT
    project = Project.query.get(project_id)
    histories = BatchHis.query.filter_by(BELONG_TASK=task_id).order_by(BatchHis.EXECUTE_TIME.desc()).paginate(page=page_num, per_page=20)
    return render_template("his_report.html", histories=histories.items, pagination=histories, task_id=task_id, project=project)


@app.route('/move/right', methods=["POST"])
def choose_api():
    api_arr = request.form.get("api_arr")
    project_id = request.form.get("project_id")
    task_id = request.form.get("task_id")
    api_list = api_arr.split(",")
    for i in api_list:
        api = Interface.query.filter(and_(Interface.BELONG_PROJECT == project_id, Interface.URL == i)).first()
        tmp_api = Batch(api.METHODS, api.URL, api.PARAMETERS, task_id, api.BELONG_PROJECT, api.CHECK_REGEXP)
        db.session.add(tmp_api)
    db.session.commit()
    return jsonify({"Message": "Choose APIs successfully!", "status": 200}), 200


@app.route('/move/left', methods=["POST"])
def unchoose_api():
    api_arr = request.form.get("api_arr")
    project_id = request.form.get("project_id")
    task_id = request.form.get("task_id")
    api_list = api_arr.split(",")
    for i in api_list:
        api = Batch.query.filter(and_(Batch.BELONG_PROJECT == project_id, Batch.URL == i, Batch.BELONG_TASK == task_id)).first()
        db.session.delete(api)
    db.session.commit()
    return jsonify({"Message": "Unchoose APIs successfully!", "status": 200}), 200


@app.route('/config/save', methods=["POST"])
def config_save():
    tmp_apis = list()
    no_apis = list()
    api_arr = request.form.get("api_arr")
    project_id = request.form.get("project_id")
    login_api = request.form.get("login_api")
    task_id = request.form.get("task_id")
    api_list = api_arr.split(",")
    apis = Batch.query.filter(and_(Batch.BELONG_PROJECT == project_id, Batch.BELONG_TASK == task_id)).all()
    for api in apis:
        if api.URL == login_api:
            api.LOGIN_API = 'Y'
        else:
            api.LOGIN_API = ''

    for i in api_list:
        for api in apis:
            if i == api.URL:
                api.NEED_LOGIN = 'Y'
    for api in apis:
        tmp_apis.append(api.URL)
    for i in tmp_apis:
        if i in api_list:
            continue
        else:
            no_apis.append(i)
    for i in no_apis:
        for api in apis:
            if i == api.URL:
                api.NEED_LOGIN = ''
    db.session.commit()
    return jsonify({"Message": "Save config successfully!", "status": 200}), 200


if __name__ == '__main__':
    manager.run()
