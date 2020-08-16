from django.shortcuts import render
from . import util
import markdown2

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def lookup(request, entry):
    entry_content = util.get_entry(entry)
    if entry_content:
        entry_content = markdown2.markdown(entry_content)
    else:
        entry_content = f"<h1>Error: there is no page for \"{entry}\"</h1>"
    return render(request, "encyclopedia/entry.html", {
        "entry_name": entry,
        "entry_content": entry_content
    })