# Generated by Django 3.1 on 2020-08-18 15:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0008_listing_watchlist'),
    ]

    operations = [
        migrations.AddField(
            model_name='listing',
            name='closed',
            field=models.BooleanField(default='False'),
        ),
    ]
