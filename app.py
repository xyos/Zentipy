from bottle import route, run, debug, template, response, request, validate, static_file, error ,view
from PIL import Image
import os
@route('/')
def index():
    return template('layout')
@route('/img', method='GET')
def server_img():
    img = request.GET.get('img')
    path, filename = os.path.split(img)
    print "path"
    print path
    print "filename"
    print filename
    return static_file(filename, root=path)
@route('/static/<filename>')
def server_static(filename):
    #serving static files on folder ./static and /static/file path
    return static_file(filename, root='./static/')
@route('/list', method='GET')
def list_images():
    filelist= []
    #setting json as MIME type
    response.set_header('Content-Type','application/json')
    dirname = request.GET.get('dir')
    if not dirname:
        return {'error' : 'directory wasn\'t send'}
    #path doesn't exists
    if not os.access(dirname , os.F_OK):
        return {'error' : 'path doesn\'t exist'}
    #no permission to read the dir
    if not os.access(dirname , os.R_OK):
        return {'error' : 'path is not readable'}
    #walking the path finding images
    for root, dirs, files in os.walk(dirname):
        for name in files:
            try:
                filename = os.path.join(root, name)
                # tests if it's and image, raises IOError
                #TODO: configure formats accepted
                im = Image.open(filename)
                #print filename, im.format, im.size
                filelist.append({"path" : filename })
            except IOError:
                pass
    if not len(filelist):
        return {'error' : 'there were no images on that path'}
    return { 'path' : dirname, 'files' : filelist}
debug(True)
run(reloader=True,host='localhost', port=8080)
