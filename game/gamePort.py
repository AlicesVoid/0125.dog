import json
import gameLogic
from django.http import JsonResponse

def jsonPagesList(request):
    
    # create list of pages to be stored locally
    pagesList = gameLogic.makeCharacterList()
    json_data = {
        'pagesList': json.dumps(pagesList)
    }
    
    return JsonResponse(json_data)
    
jsonPagesList()