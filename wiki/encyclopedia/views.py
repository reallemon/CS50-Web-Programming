from django.shortcuts import render
from django.shortcuts import redirect
from django import forms
from . import util
import markdown2
import random
from . import util

class NewArticleForm(forms.Form):
    title = forms.CharField(widget=forms.TextInput(attrs={"class":"form-control", "id":"newTitle"}))
    body = forms.CharField(widget=forms.Textarea(attrs={"rows":"10", "class":"form-control", "id":"newBody"}))

    def clean_title(self):
        data = self.cleaned_data.get("title")
        entries = util.list_entries()

        if data.lower() in [entry.lower() for entry in entries]:
            raise forms.ValidationError("That article already exists")

        return data

class EditArticle(forms.Form):
    title = forms.CharField(widget=forms.TextInput(
        attrs={"class": "form-control", "id": "newTitle"}))
    body = forms.CharField(widget=forms.Textarea(
        attrs={"rows": "10", "class": "form-control", "id": "newBody"}))
    
    def clean_body(self):
        return self.cleaned_data.get("body")

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

def new(request):
    if request.method == "POST":
        form = NewArticleForm(request.POST)
        if form.is_valid():
            form_title = form.cleaned_data["title"]
            with open(f"entries/{form_title}.md", "w") as file:
                file.write(form.cleaned_data["body"])
            return redirect("encyclopedia:lookup", entry=form_title)
        else:
            return render(request, "encyclopedia/new.html", {
                "form": form
            })
    else:
        return render(request, "encyclopedia/new.html", {
            "form": NewArticleForm()
        })

def edit(request, entry):
    if request.method == "GET":
        form = EditArticle(initial={"title": entry, "body": util.get_entry(entry)})
        
        return render(request, "encyclopedia/edit.html", {
            "form": form,
            "entry": entry
        })
    else:
        form = EditArticle(request.POST)
        if form.is_valid():
            form_title = form.cleaned_data["title"]
            util.save_entry(form_title, form.cleaned_data["body"])
            return redirect("encyclopedia:lookup", entry=form_title)
        # if form.is_valid():
        #     form_title = form.cleaned_data["title"]
        #     with open(f"entries/{form_title}.md", "w") as file:
        #         file.write(form.cleaned_data["body"])
        #     return redirect("encyclopedia:lookup", entry=form_title)
        else:
            return render(request, "encyclopedia/edit.html", {
                "form": form,
                "entry": entry
            })
