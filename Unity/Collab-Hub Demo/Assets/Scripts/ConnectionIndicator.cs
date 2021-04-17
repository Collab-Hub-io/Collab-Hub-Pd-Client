using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ConnectionIndicator : MonoBehaviour
{
    public static ConnectionIndicator instance;

    public Image indicator;
    public float staleDuration = 1.5f;

    private void Awake()
    {
        if (instance == null)
        {
            instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void Ping()
    {
        StopAllCoroutines();
        StartCoroutine(StartPing());
    }

    IEnumerator StartPing()
    {
        indicator.color = Color.green;
        yield return new WaitForSeconds(staleDuration);
        indicator.color = Color.red;
        yield return true;
    }
}
