"use client";

import { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import useKakaoLoader from "@/components/use-kakao-loader";
import { IconMapPin } from "@tabler/icons-react";

interface Place {
  latitude: number;
  longitude: number;
  place_name: string;
  distance: string;
  id: string;
}

export default function HospitalScreen() {
  useKakaoLoader();

  // 초기 위도 경도 서울
  const [latitude, setLatitude] = useState(37.5665);
  const [longitude, setLongitude] = useState(126.978);
  const [list, setList] = useState<Place[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("병원");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });

  // RN에서 위치 정보를 받아오는 함수
  const getLocationFromRN = () => {
    // React Native WebView에서 메시지를 받는 함수
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "location" && data.latitude && data.longitude) {
          const isInKorea = isLocationInKorea(data.latitude, data.longitude);

          if (isInKorea) {
            setLatitude(data.latitude);
            setLongitude(data.longitude);
            setMapCenter({ lat: data.latitude, lng: data.longitude });
            console.log("위치 업데이트:", data.latitude, data.longitude);
          } else {
            console.log("위치가 한국 밖입니다. 기본 서울 위치를 사용합니다.");
          }
        }
      } catch (error) {
        console.error("위치 데이터 파싱 오류:", error);
      }
    };

    // 메시지 리스너 등록
    window.addEventListener("message", handleMessage);

    // RN에 위치 요청 메시지 전송
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "requestLocation",
        })
      );
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  };

  // 위치가 한국 내에 있는지 확인하는 함수
  const isLocationInKorea = (lat: number, lng: number) => {
    const koreaLatRange = { min: 33.0, max: 38.6 };
    const koreaLngRange = { min: 124.5, max: 132.0 };

    return (
      lat >= koreaLatRange.min &&
      lat <= koreaLatRange.max &&
      lng >= koreaLatRange.min &&
      lng <= koreaLngRange.max
    );
  };

  const searchPlaces = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${searchKeyword}&x=${longitude}&y=${latitude}&radius=2000`,
        {
          headers: {
            Authorization: `KakaoAK 1bf8beb8e963a381f6cdf1639d02f616`,
          },
        }
      );

      const data = await response.json();

      if (data.documents && data.documents.length > 0) {
        const results = data.documents.map((doc: any) => ({
          latitude: parseFloat(doc.y),
          longitude: parseFloat(doc.x),
          place_name: doc.place_name,
          distance: doc.distance,
          id: doc.id,
        }));
        setList(results);
      } else {
        alert("검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLocationFromRN();
  }, []);

  useEffect(() => {
    searchPlaces();
  }, [searchKeyword, latitude, longitude]);

  const handleRefreshLocation = () => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "requestLocation",
        })
      );
    }
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setMapCenter({ lat: place.latitude, lng: place.longitude });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "white",
      }}
    >
      {/* 검색 탭 */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          borderBottom: "1px solid #ddd",
        }}
      >
        <button
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            backgroundColor: "white",
            borderBottom: "none",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => setSearchKeyword("병원")}
        >
          <span
            style={{
              fontSize: "16px",
              color: searchKeyword === "병원" ? "black" : "#888",
              fontWeight: searchKeyword === "병원" ? "bold" : "normal",
            }}
          >
            병원
          </span>
          {searchKeyword === "병원" && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "10%",
                width: "80%",
                height: "2px",
                backgroundColor: "black",
              }}
            />
          )}
        </button>
        <button
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            backgroundColor: "white",
            borderBottom: "none",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => setSearchKeyword("약국")}
        >
          <span
            style={{
              fontSize: "16px",
              color: searchKeyword === "약국" ? "black" : "#888",
              fontWeight: searchKeyword === "약국" ? "bold" : "normal",
            }}
          >
            약국
          </span>
          {searchKeyword === "약국" && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "10%",
                width: "80%",
                height: "2px",
                backgroundColor: "black",
              }}
            />
          )}
        </button>
      </div>

      {/* 지도 */}
      <div
        style={{
          flex: 1,
          position: "relative",
          height: "50%",
        }}
      >
        <Map
          center={mapCenter}
          style={{ width: "100%", height: "100%" }}
          level={4}
        >
          {/* 현재 위치 마커 */}
          <MapMarker
            position={{ lat: latitude, lng: longitude }}
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
              size: { width: 24, height: 35 },
              options: {
                offset: { x: 12, y: 35 },
              },
            }}
          />

          {/* 검색 결과 마커들 */}
          {list.map((place) => (
            <MapMarker
              key={place.id}
              position={{ lat: place.latitude, lng: place.longitude }}
              title={place.place_name}
              image={
                selectedPlace?.id === place.id
                  ? {
                      src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                      size: { width: 24, height: 35 },
                      options: {
                        offset: { x: 12, y: 35 },
                      },
                    }
                  : undefined
              }
            />
          ))}
        </Map>

        {/* 현재 위치 새로고침 버튼 */}
        <button
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            zIndex: 10,
            backgroundColor: "white",
            border: "none",
            padding: "12px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleRefreshLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid #f3f3f3",
                borderTop: "2px solid #333",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <IconMapPin size={20} />
          )}
        </button>
      </div>

      {/* 검색 결과 리스트 */}
      <div
        style={{
          flex: "0 0 40%",
          maxHeight: "40%",
          borderTop: "1px solid #ddd",
          overflow: "auto",
        }}
      >
        <div style={{ padding: "8px 0" }}>
          {list.map((item) => (
            <div
              key={item.id}
              onClick={() => handlePlaceClick(item)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid #eee",
                backgroundColor:
                  selectedPlace?.id === item.id ? "#f0f8ff" : "white",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedPlace?.id !== item.id) {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPlace?.id !== item.id) {
                  e.currentTarget.style.backgroundColor = "white";
                }
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: selectedPlace?.id === item.id ? "bold" : "500",
                  color: selectedPlace?.id === item.id ? "#0066cc" : "black",
                }}
              >
                {item.place_name}
              </span>
              <span style={{ fontSize: "14px", color: "#666" }}>
                {(parseInt(item.distance) / 1000).toFixed(2)} km
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
