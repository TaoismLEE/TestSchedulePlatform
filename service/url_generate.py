def url_generate(url, parameters):
    strValue = ""
    for item in parameters.keys():
        strValue = strValue + "&" + item + "=" + str(parameters[item])
    strValue = strValue.lstrip("&")
    actual_url = url + "/?" + strValue
    return(actual_url)