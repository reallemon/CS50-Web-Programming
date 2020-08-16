from django.shortcuts import render
from . import util
import markdown2

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def lookup(request, entry):
    entry_md = util.get_entry(entry)
    return render(request, "encyclopedia/entry.html", {
        "entry_name": entry,
        "entry_content": markdown2.markdown(entry_md)
    })
