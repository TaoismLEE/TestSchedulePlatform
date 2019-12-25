from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_, or_

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    USERNAME = db.Column(db.String(50), unique=True)
    PASSWORD = db.Column(db.String(16))
    QQ = db.Column(db.String(15))
    MSN = db.Column(db.String(15))
    PHONE = db.Column(db.String(11))
    MAIL = db.Column(db.String(60))
    FACE_IMG = db.Column(db.Text)
    FLAG = db.Column(db.String(1))
    projects = db.relationship("Project", backref="user")

    def __init__(self, username, password, qq="", msn="", phone="", mail="", photo="", flag="Y"):
        self.USERNAME = username
        self.PASSWORD = password
        self.QQ = qq
        self.MSN = msn
        self.PHONE = phone
        self.MAIL = mail
        self.FACE_IMG = photo
        self.FLAG = flag


class Project(db.Model):
    __tablename__ = "projects"
    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    PROJECT_LOGO = db.Column(db.Text)
    PROJECT_NAME = db.Column(db.String(50))
    PROJECT_URL = db.Column(db.String(50))
    INCHARGER = db.Column(db.String(50))
    PHONE = db.Column(db.String(11))
    DESCRIPTION = db.Column(db.String(150))
    OWNED_BY = db.Column(db.Integer, db.ForeignKey("users.ID"), nullable=False)
    VALID = db.Column(db.String(1))
    IC_EMAIL = db.Column(db.String(1000))
    interfaces = db.relationship('Interface', backref='project')

    def __init__(self, project_name, project_url, owned_by, project_logo="", incharger="", phone="", description="", valid="Y", email=""):
        self.PROJECT_LOGO = project_logo
        self.PROJECT_NAME = project_name
        self.PROJECT_URL = project_url
        self.INCHARGER = incharger
        self.PHONE = phone
        self.DESCRIPTION = description
        self.OWNED_BY = owned_by
        self.VALID = valid
        self.IC_EMAIL = email


class Interface(db.Model):
    __tablename__ = "interfaces"
    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    METHODS = db.Column(db.String(8))
    URL = db.Column(db.String(100))
    PARAMETERS = db.Column(db.String(500))
    API_RETURN = db.Column(db.Text)
    CHECK_REGEXP = db.Column(db.String(200))
    CHECK_RESULT = db.Column(db.Text)
    EXECUTE_TIME = db.Column(db.DateTime)
    BELONG_PROJECT = db.Column(db.Integer, db.ForeignKey("projects.ID"), nullable=False)
    ALIAS = db.Column(db.String(255))

    def __init__(self, methods, project_url, parameters, belong_project, response, current_time, check_regexp="", check_result="", alias=""):
        self.METHODS = methods
        self.URL = project_url
        self.PARAMETERS = parameters
        self.CHECK_REGEXP = check_regexp
        self.BELONG_PROJECT = belong_project
        self.API_RETURN = response
        self.EXECUTE_TIME = current_time
        self.CHECK_RESULT = check_result
        self.ALIAS =alias


class InterfaceLog(db.Model):
    __tablename__ = "interfaces_logs"
    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    METHODS = db.Column(db.String(8))
    URL = db.Column(db.String(100))
    PARAMETERS = db.Column(db.String(500))
    API_RETURN = db.Column(db.Text)
    CHECK_REGEXP = db.Column(db.String(200))
    CHECK_RESULT = db.Column(db.Text)
    EXECUTE_TIME = db.Column(db.DateTime)
    BELONG_PROJECT = db.Column(db.Integer, nullable=False)

    def __init__(self, re_id, methods, project_url, parameters, belong_project, response, current_time, check_regexp, check_result):
        self.ID = re_id
        self.METHODS = methods
        self.URL = project_url
        self.PARAMETERS = parameters
        self.CHECK_REGEXP = check_regexp
        self.BELONG_PROJECT = belong_project
        self.API_RETURN = response
        self.EXECUTE_TIME = current_time
        self.CHECK_RESULT = check_result


class Task(db.Model):
    __tablename__ = "tasks"
    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    TASK_NAME = db.Column(db.String(50))
    CRON_EXP = db.Column(db.String(20))
    STATUS = db.Column(db.String(1))
    CREATE_TIME = db.Column(db.DateTime)
    BELONG_PROJECT = db.Column(db.Integer)
    START_TIME = db.Column(db.DateTime)
    END_TIME = db.Column(db.DateTime)
    EXECUTE_TIME = db.Column(db.Integer)

    def __init__(self, task_name, cron, status, create_time, belong_project):
        self.TASK_NAME = task_name
        self.CRON_EXP = cron
        self.STATUS = status
        self.CREATE_TIME = create_time
        self.BELONG_PROJECT = belong_project


class Batch(db.Model):
    __tablename__ = "batches"
    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    METHODS = db.Column(db.String(8))
    URL = db.Column(db.String(100))
    PARAMETERS = db.Column(db.String(500))
    CHECK_REGEXP = db.Column(db.String(200))
    BELONG_TASK = db.Column(db.Integer)
    BELONG_PROJECT = db.Column(db.Integer)
    LOGIN_API = db.Column(db.String(1))
    NEED_LOGIN = db.Column(db.String(1))
    ALIAS = db.Column(db.String(255))

    def __init__(self, methods, project_url, parameters, belong_task, belong_project, check_regexp, alias):
        self.METHODS = methods
        self.URL = project_url
        self.PARAMETERS = parameters
        self.CHECK_REGEXP = check_regexp
        self.BELONG_TASK = belong_task
        self.BELONG_PROJECT = belong_project
        self.ALIAS = alias


class BatchHis(db.Model):
    __tablename__ = "batches_his"
    ID = db.Column(db.Integer, primary_key=True, nullable=False)
    BATCH_ID = db.Column(db.String(25))
    METHODS = db.Column(db.String(8))
    URL = db.Column(db.String(255))
    PARAMETERS = db.Column(db.String(500))
    API_RETURN = db.Column(db.Text)
    CHECK_REGEXP = db.Column(db.String(200))
    CHECK_RESULT = db.Column(db.Text)
    EXECUTE_TIME = db.Column(db.DateTime)
    BELONG_TASK= db.Column(db.Integer)
    BELONG_PROJECT = db.Column(db.Integer)
    LOGIN_API = db.Column(db.String(1))
    NEED_LOGIN = db.Column(db.String(1))
    ALIAS = db.Column(db.String(255))

    def __init__(self, batch_id, methods, project_url, parameters, api_return, check_regexp, check_result, execute_time,
                 belong_task, belong_project, login_api, need_login, alias):
        self.BATCH_ID = batch_id
        self.METHODS = methods
        self.URL = project_url
        self.PARAMETERS = parameters
        self.API_RETURN = api_return
        self.CHECK_REGEXP = check_regexp
        self.CHECK_RESULT = check_result
        self.EXECUTE_TIME = execute_time
        self.BELONG_TASK = belong_task
        self.BELONG_PROJECT = belong_project
        self.LOGIN_API = login_api
        self.NEED_LOGIN = need_login
        self.ALIAS = alias
