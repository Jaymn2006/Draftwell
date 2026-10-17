cmake_minimum_required(VERSION 3.16)
project(draftwell_cpp LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

add_library(draftwell_paragraph STATIC
    paragraph_index.cpp
    paragraph_index.hpp
)

target_include_directories(draftwell_paragraph PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

add_library(draftwell_paragraph_shared SHARED
    paragraph_index.cpp
    paragraph_index.hpp
    paragraph_export.cpp
)

target_include_directories(draftwell_paragraph_shared PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
set_target_properties(draftwell_paragraph_shared PROPERTIES
    OUTPUT_NAME "draftwell_paragraph"
    PREFIX ""
)

add_executable(paragraph_cli paragraph_cli.cpp)
target_link_libraries(paragraph_cli PRIVATE draftwell_paragraph)
