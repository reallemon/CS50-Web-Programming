from django.shortcuts import render
from django.shortcuts import redirect
from . import util
import markdown2
import random
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

def random_page(request):
    entry = random.choice(util.list_entries())
    return redirect("encyclopedia:lookup", entry=entry)

def search(request):
    query = request.GET['q']
    entries = util.list_entries()
    if query.lower() in [lower_entry.lower() for lower_entry in entries]:
        return redirect("encyclopedia:lookup", entry=query)
    else:
        search_results = [entry for entry in entries if query.lower() in entry.lower()]
        return render(request, "encyclopedia/search.html", {
            "query":query,
            "search_results":search_results
        })
