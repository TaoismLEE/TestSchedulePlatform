import yaml
from config.global_var import PROJECT_PATH


class ParseYaml(object):
    def __init__(self, file_name):
        self.file_path = PROJECT_PATH + u'/config/' + file_name

    def get_yaml_dict(self):
        f = open(self.file_path, 'r', encoding='utf-8')
        data_dict = yaml.load(f.read())
        return data_dict